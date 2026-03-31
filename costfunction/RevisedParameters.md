## Fitted Function Results

### linearFunction

R^2 Score: 0.8599

Kendall tau: 0.8211 (p=6.274e-09)

```math
f(N,giniC,P,giniT)=0.29683428N+4.00362478giniC+1.54322871P+0.10781809giniT
```

### quadraticFunction

R^2 Score: 0.9557

Kendall tau: 0.8864 (p=3.588e-10)

```math
\begin{aligned}
f(N,giniC,P,giniT)=&-1.30876641+1.50792892N-4.92417509P-7.53047359giniC+11.62444852giniT\\
&-0.19435370N^2-5.97501541P^2-12.02618930giniC^2+5.81062458giniT^2\\
&+1.41363610NP+4.06098183N\,giniC-4.32345565N\,giniT\\
&+11.09574575P\,giniC+6.14307731P\,giniT-2.11467568giniC\,giniT
\end{aligned}
```

### testfunction2

R^2 Score: -0.4194

Kendall tau: 0.8143 (p=1.531e-08)

```math
f(N,giniC,P,giniT)=1.69229585N+1.60977697P+1.57993703giniC+1.81805224giniT
```

R^2 Score: 0.8648

Kendall tau: 0.8211 (p=6.274e-09)

```math
f(N,giniC,P,giniT)=-0.31258550+0.36193186N+1.47236834P+4.38228801giniC-0.22941148giniT+0.40863876(giniC\cdot P\cdot giniT)
```




### pySR Best result

R² Score: 0.9322

Kendall tau: 0.8701

```math
f(N,giniC,P,giniT) = N \cdot (N \cdot (-0.08342513) + giniC + (P + 1.5941482) \cdot 0.3979973)
```

**Expanded form:**

```math
f(N,giniC,P,giniT) = -0.08342513N^2 + 0.39799730NP + NginiC + 0.63438274N
```

