learningTaskset.csv structure

Taskset ID, Number Tasks (N), Utilization of Taskset (U), Sum of Preemptions/#jobs in Hyperperiod (P), Sum Laxity/#jobs in Hyperperiod (L), GiniC, GiniT, Hyperperiod/length, Rated Difficulty from 1-5

ts_1,    2,     0.4,   0,    9,    5,     1




## Fitted Function Results

### linearFunction

R^2 Score: 0.8245

Kendall tau: 0.8151 (p=1.514e-06)

```math
f(N,U,P,L)=0.40013634N-0.33897675U+3.78137678P+0.06086550L
```

### quadraticFunction

R^2 Score: 0.9564

Kendall tau: 0.8997 (p=1.102e-07)

```math
\begin{aligned}
f(N,U,P,L)=&-0.06146612N^2-0.68993774U^2-0.05654303P^2+0.00600679L^2\\
&+0.56790215NU+1.68980677NP-0.04976399NL\\
&-1.36250234UP+0.52657613UL-0.48956625PL
\end{aligned}
```

### testfunction2

R^2 Score: 0.0332

Kendall tau: 0.7621 (p=6.89e-06)

```math
\begin{aligned}
f(N,U,P,L)=&(-0.03915716\cdot N)\cdot(0.48803441\cdot(1+P))\\
&\cdot(2.12586466\cdot U)\cdot(2.18769852\cdot L)\\
&\cdot(-0.18954058\cdot(1+P)\cdot U\cdot N)
\end{aligned}
```

### testfunction3

R^2 Score: 0.8522

Kendall tau: 0.8045 (p=2.065e-06)

```math
f(N,U,P,L)=0.30780077+0.24972973N+0.19592774U+0.49218262P+0.97722747(UPL)
```


pySR best fitting function:
```math
P \cdot \left(U\left(U^3(N+L)-22.028917\right)+19.941519\right)+1.1272649
```

