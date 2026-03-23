learningTaskset.csv structure

Taskset ID, Number Tasks (N), Utilization of Taskset (U), Sum of Preemptions/#jobs in Hyperperiod (P), Sum Laxity/#jobs in Hyperperiod (L), Hyperperiod/length, Rated Difficulty from 1-5

ts_1,    2,     0.4,   0,    9,    5,     1




Currents weights for functions:

Linear: 
$$
f(N,U,P,L)=0.354N-0.629U+5.02P+0.151L
$$

Quadratic:
$$
\begin{aligned}
f(N,U,P,L)=&-0.230N^2-1.534U^2+4.542P^2-0.0079L^2\\
&+1.543NU+2.657NP+0.094NL\\
&-4.626UP+0.006UL-1.497PL
\end{aligned}
$$

testfunction2:
$$
\begin{aligned}
f(N,U,P,L)=&(1.615\cdot N)\cdot(-2.485\cdot(1+P))\\
&\cdot(-0.924\cdot U)\cdot(1.99\cdot L)\\
&\cdot(0.0015\cdot(1+P)\cdot U\cdot N)
\end{aligned}
$$

testfunction3:
$$
f(N,U,P,L)=0.956+0.0012N+0.220U-0.999P+1.903(UPL)
$$



pySR best fitting function:
$$
P \cdot \left(U\left(U^3(N+L)-22.028917\right)+19.941519\right)+1.1272649
$$

