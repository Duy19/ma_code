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

R^2 Score: -0.6430

Kendall tau: 0.8427 (p=2.991e-09)

```math
\begin{aligned}
f(N,giniC,P,giniT)=&(0.85297580\cdot N)\cdot(0.86003098\cdot(1+P))\\
&\cdot(0.81318491\cdot giniC)\cdot(1.08439605\cdot giniT)\\
&\cdot(1.12591146\cdot(1+P)\cdot giniC\cdot N)
\end{aligned}
```

### testfunction3

R^2 Score: 0.8647

Kendall tau: 0.8211 (p=6.274e-09)

```math
f(N,giniC,P,giniT)=-0.30707590+0.36027311N+4.24616187giniC+1.42941434P+0.37973097(giniC\cdot P\cdot giniT)
```



### pySR

Best model:

```math
f(N,U,P,L,giniT) = U \cdot L \cdot giniT + P \cdot (N - 1.7743556) + 1.1095759
```

Metrics:

- `R^2 = 0.9368`
- `Kendall's tau = 0.8810`


This specific PySR expression does not use `giniC`.

