import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pysr import PySRRegressor
from scipy.optimize import curve_fit
from scipy.stats import kendalltau
from itertools import combinations
from matplotlib.lines import Line2D

# Load data from CSV file
data = pd.read_csv('learningTasksets.csv')
raw = data[['N', 'U', 'P', 'L', 'giniC', 'giniT', 'giniD']].values
raw_without_giniD = data[['N', 'U', 'P', 'L', 'giniC', 'giniT']].values
raw2 = data[['N', 'P', 'giniC', 'giniT', 'giniD']].values
rawFirst = data[['N', 'U', 'P', 'L']].values
y = data['difficulty'].values
N = raw[:, 0]
U = raw[:, 1]
P = raw[:, 2]
L = raw[:, 3]
GC = raw[:, 4]
GT = raw[:, 5]
GD = raw[:, 6]
X = (N, U, P, L, GC, GT, GD)


def calculate_r2(y_true, y_pred):
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    return 1 - (ss_res / ss_tot) if ss_tot != 0 else np.nan


def calculate_kendall_tau(y_true, y_pred):
    return kendalltau(y_true, y_pred)


def calculate_fit_metrics(y_true, y_pred):
    r2 = calculate_r2(y_true, y_pred)
    tau, tau_pvalue = calculate_kendall_tau(y_true, y_pred)
    return {
        "r2": r2,
        "tau": tau,
        "tau_pvalue": tau_pvalue,
    }


def example_lorenz_curve():
    data = np.array([2000, 400, 300, 1700, 600])
    data_sorted = np.sort(data)
    data_cum = np.cumsum(data_sorted)
    data_cum = np.insert(data_cum, 0, 0)
    data_cumulative = np.cumsum(data_sorted) / np.sum(data_sorted)

    holder_cumulative = np.arange(1, len(data) + 1) / len(data) # 5 holders so each one is 20%

    x_plot = np.insert(holder_cumulative, 0, 0)
    y_plot = np.insert(data_cumulative, 0, 0)

    fig, ax =  plt.subplots(figsize=(8, 6))
    ax.plot(x_plot, y_plot, marker='o', color='steelblue', label='Lorenz Curve', linewidth=2)
    ax.plot([0,1], [0,1], label='Line of Perfect Equality', color='orange', linestyle='-')

    ax.set_xlabel('Cumulative percentage Share of Stock Holders', fontsize=12, fontweight='bold')
    ax.set_ylabel('Cumulative percentage Share of Processor Stocks', fontsize=12, fontweight='bold')
    x_position = 0.52
    y_position = 0.35

    for i in range(len(data)):
        ax.annotate(xy=(x_plot[i], y_plot[i]), text=f'{data_cum[i]}/5000', xytext=(13, 8), textcoords='offset points', fontsize=8, fontweight='bold', color='black', ha='center', va='bottom')

    ax.text(x_position, y_position, "Gini Index", fontsize=12, fontweight='bold', color='black', ha='center')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.fill_between(x_plot, y_plot, x_plot, color='steelblue', alpha=0.3)
    ax.set_title('Lorenz Curve Example', fontsize=14, fontweight='bold')
    ax2 = ax.twinx()
    ax2.set_yticks([])
    # Rechte Achse 
    ax2.spines['right'].set_color('red')
    ax.spines['bottom'].set_color('red')
    ax.spines['bottom'].set_linewidth(2)
    ax2.spines['right'].set_linewidth(2)
    ax.grid(True, alpha=0.3)
    red_axis = Line2D(
    [0], [0],
    color='red',
    lw=2,
    label='Axes Highlight (Red)'
    )
    ax.legend(loc='upper left', handles=[ax.lines[0], ax.lines[1], red_axis], labels=['Lorenz Curve', 'Line of Perfect Equality', 'Line of Perfect Inequality'], fontsize=10)
    plt.show()


def plotVariableDifficultyCorrelation():
    variables = [
        # ('N', N, 'Number of Tasks'),
        # ('U', U, 'Utilization'),
        # ('P', P, 'Avg Preemption'),
        # ('L', L, 'Avg Laxity'),
        ('giniC', GC, 'Gini Coefficient C'),
        ('giniT', GT, 'Gini Coefficient T'),
        ('giniD', GD, 'Gini Coefficient D'),
    ]

    n_rows = 2
    n_cols = max(1, int(np.ceil(len(variables) / n_rows)))
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(6 * n_cols, 10))
    fig.suptitle('Parameter Correlation with Task Difficulty', fontsize=16, fontweight='bold')
    
    axes_flat = np.array(axes).reshape(-1)

    print("\n Linear vs Polynomial (2nd order) fit summary per parameter:")
    
    for idx, (var_name, var_data, var_label) in enumerate(variables):
        ax = axes_flat[idx]
        
        ax.scatter(var_data, y, alpha=0.6, s=80, color='steelblue', edgecolors='black', linewidth=0.5)
        
        # Linear fit: y = m*x + b
        linear_coeffs = np.polyfit(var_data, y, 1)
        linear_fn = np.poly1d(linear_coeffs)

        # Polynomial fit (order 2): y = a*x^2 + b*x + c
        poly_coeffs = np.polyfit(var_data, y, 2)
        poly_fn = np.poly1d(poly_coeffs)

        x_trend = np.linspace(var_data.min(), var_data.max(), 100)

        y_pred_linear = linear_fn(var_data)
        y_pred_poly = poly_fn(var_data)

        r2_linear = calculate_r2(y, y_pred_linear)
        r2_poly = calculate_r2(y, y_pred_poly)
        delta_r2 = r2_poly - r2_linear

        mae_linear = np.mean(np.abs(y - y_pred_linear))
        mae_poly = np.mean(np.abs(y - y_pred_poly))
        delta_mae = mae_poly - mae_linear

        # Compute Kendall tau for raw x vs y
        tau, _ = calculate_kendall_tau(var_data, y)

        ax.plot(
            x_trend,
            linear_fn(x_trend),
            color='orange',
            linestyle='-',
            linewidth=1.8,
            label=f'Linear: Tau={tau:.3f}, R²={r2_linear:.3f}',
            alpha=0.9,
        )

        ax.plot(
            x_trend,
            poly_fn(x_trend),
            'r--',
            linewidth=2,
            label=f'Polynomial 2nd order: Tau={tau:.3f}, R²={r2_poly:.3f}',
            alpha=0.8,
        )
        
        print(
            f"{var_name}: Tau={tau:.4f} | "
            f"Linear R²={r2_linear:.4f} vs Polynomial 2nd order R²={r2_poly:.4f} | ΔR²={delta_r2:+.4f}"
        )
        
        ax.set_xlabel('', fontsize=11, fontweight='bold')
        ax.set_ylabel('Difficulty', fontsize=11, fontweight='bold')
        ax.set_title(f'{var_name} vs Difficulty', fontsize=12, fontweight='bold')
        ax.grid(True, alpha=0.3)
        ax.legend(fontsize=8, loc='best')

    for idx in range(len(variables), len(axes_flat)):
        fig.delaxes(axes_flat[idx])
    
    plt.tight_layout()
    plt.savefig('parameter_difficulty_correlation.png', dpi=150, bbox_inches='tight')
    print("\n Saved plot as 'parameter_difficulty_correlation.png'")
    plt.show()



def main():
    #example_lorenz_curve()
    plotVariableDifficultyCorrelation()

if __name__ == "__main__":
    main()