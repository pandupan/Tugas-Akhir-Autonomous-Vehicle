from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F


class SKAttention(nn.Module):
    """Selective Kernel attention block used by the trained SKNet YOLO weights."""

    def __init__(
        self,
        in_channels: int,
        out_channels: int | None = None,
        kernels: list[int | str] | tuple[int | str, ...] | int | str | None = None,
        reduction: int = 16,
        group: int = 1,
        use_dilated: bool = True,
        dilation: int = 2,
    ) -> None:
        super().__init__()
        _ = out_channels

        if kernels is not None:
            self.kernels = list(kernels) if isinstance(kernels, (list, tuple)) else [kernels]
        else:
            self.kernels = [3, "dilated"] if use_dilated else [3, 5]

        self.use_dilated = use_dilated
        self.dilation = dilation
        self.d = max(in_channels // reduction, 8)

        self.convs = nn.ModuleList()
        for kernel in self.kernels:
            if kernel == "dilated":
                self.convs.append(
                    nn.Sequential(
                        nn.Conv2d(
                            in_channels,
                            in_channels,
                            3,
                            padding=self.dilation,
                            dilation=self.dilation,
                            groups=group,
                            bias=False,
                        ),
                        nn.BatchNorm2d(in_channels),
                        nn.ReLU(inplace=True),
                    )
                )
            else:
                kernel_size = int(kernel)
                self.convs.append(
                    nn.Sequential(
                        nn.Conv2d(
                            in_channels,
                            in_channels,
                            kernel_size,
                            padding=kernel_size // 2,
                            groups=group,
                            bias=False,
                        ),
                        nn.BatchNorm2d(in_channels),
                        nn.ReLU(inplace=True),
                    )
                )

        self.gap = nn.AdaptiveAvgPool2d(1)
        self.fc1 = nn.Linear(in_channels, self.d, bias=True)
        self.fcs = nn.ModuleList([nn.Linear(self.d, in_channels, bias=True) for _ in self.kernels])
        self.softmax = nn.Softmax(dim=0)
        self.alpha = nn.Parameter(torch.full((1,), 0.01))

        nn.init.kaiming_normal_(self.fc1.weight, nonlinearity="relu")
        nn.init.zeros_(self.fc1.bias)
        for fc in self.fcs:
            nn.init.normal_(fc.weight, std=0.01)
            nn.init.zeros_(fc.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feats = [conv(x) for conv in self.convs]
        fused = sum(feats)
        pooled = self.gap(fused).flatten(1)
        hidden = F.relu(self.fc1(pooled))

        attention = torch.stack(
            [fc(hidden).view(x.size(0), -1, 1, 1) for fc in self.fcs],
            dim=0,
        )
        attention = self.softmax(attention.clamp(-10, 10))
        selected = sum(weight * feat for weight, feat in zip(attention, feats))
        return x + self.alpha * selected
