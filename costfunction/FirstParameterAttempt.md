learningTaskset.csv structure

Taskset ID, Number Tasks (N), Utilization of Taskset (U), Sum of Preemptions/#jobs in Hyperperiod (P), Sum Laxity/#jobs in Hyperperiod (L), GiniC, GiniT, Hyperperiod/length, Rated Difficulty from 1-5

ts_1,    2,     0.4,   0,    9,    5,     1




## Fitted Function Results

### linearFunction

R^2 Score: 0.8333

Kendall tau: 0.8255 (p=5.009e-09)

```math
f(N,U,P,L)=0.43222063N-0.49604033U+4.00122238P+0.07080621L
```

### quadraticFunction

R^2 Score: 0.9353

Kendall tau: 0.8799 (p=4.619e-10)

```math
\begin{aligned}
f(N,U,P,L)=&-0.15988066N^2-0.45403228U^2-0.58174284P^2-0.00778082L^2\\
&+1.02845005NU+1.38856167NP+0.07616045NL\\
&-2.26391780UP-0.02637567UL+0.11530321PL
\end{aligned}
```

### testfunction2

R^2 Score: 0.1338

Kendall tau: 0.7875 (p=2.438e-08)

```math
\begin{aligned}
f(N,U,P,L)=&(0.17276299\cdot N)\cdot(0.13654328\cdot(1+P))\\
&\cdot(1.50766765\cdot U)\cdot(1.44166006\cdot L)\\
&\cdot(0.36683799\cdot(1+P)\cdot U\cdot N)
\end{aligned}
```

### testfunction3

R^2 Score: 0.8741

Kendall tau: 0.8473 (p=1.964e-09)

```math
f(N,U,P,L)=0.32078550+0.34668392N-0.24213688U+1.33795769P+0.79720315(UPL)



pySR best fitting function:
```math
P \cdot \left(U\left(U^3(N+L)-22.028917\right)+19.941519\right)+1.1272649
```

