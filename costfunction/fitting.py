import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pysr import PySRRegressor
from scipy.optimize import curve_fit
from scipy.stats import kendalltau
from itertools import combinations

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


DATASETS = {
    "raw": {
        "x": raw,
        "features": ["N", "U", "P", "L", "giniC", "giniT", "giniD"],
    }
    # "raw2": {
    #     "x": raw2,
    #     "features": ["N", "P", "giniC", "giniT", "giniD"],
    # },
    # "rawFirst": {
    #     "x": rawFirst,
    #     "features": ["N", "U", "P", "L"],
    # },
}


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


def _as_tuple_matrix(dataset_x):
    return tuple(dataset_x[:, i] for i in range(dataset_x.shape[1]))


def _linear_model():
    def model(X_tuple, *params):
        return sum(weight * feature for weight, feature in zip(params, X_tuple))

    return model


def _quadratic_model(n_features, include_interactions=True):
    interaction_pairs = list(combinations(range(n_features), 2)) if include_interactions else []

    def model(X_tuple, *params):
        intercept = params[0]
        linear = params[1:1 + n_features]
        squares = params[1 + n_features:1 + (2 * n_features)]
        interactions = params[1 + (2 * n_features):]

        result = intercept
        for i in range(n_features):
            xi = X_tuple[i]
            result = result + linear[i] * xi + squares[i] * (xi ** 2)

        for coeff, (i, j) in zip(interactions, interaction_pairs):
            result = result + coeff * X_tuple[i] * X_tuple[j]

        return result

    return model


def _build_test_function_model(feature_names):
    index_by_feature = {feature: idx for idx, feature in enumerate(feature_names)}
    required = ["N", "U", "P", "L", "giniT"]

    if not all(feature in index_by_feature for feature in required):
        return None

    n_idx = index_by_feature["N"]
    u_idx = index_by_feature["U"]
    p_idx = index_by_feature["P"]
    l_idx = index_by_feature["L"]
    gt_idx = index_by_feature["giniT"]

    def model(X_tuple, a, b, c, d, e, f, g):
        N = X_tuple[n_idx]
        U = X_tuple[u_idx]
        P = X_tuple[p_idx]
        L = X_tuple[l_idx]
        GT = X_tuple[gt_idx]
        return a * N * P + b * np.exp(c * L * P) + d * U * L * (1 - e * L) + f * GT * (1 - g / N)

    return model


def _build_exp_ginit_preference_model(feature_names):
    index_by_feature = {feature: idx for idx, feature in enumerate(feature_names)}
    required = ["N", "P", "L", "giniT"]

    if not all(feature in index_by_feature for feature in required):
        return None

    n_idx = index_by_feature["N"]
    p_idx = index_by_feature["P"]
    l_idx = index_by_feature["L"]
    gt_idx = index_by_feature["giniT"]

    def model(X_tuple, w1, w2, w3):
        N = X_tuple[n_idx]
        P = X_tuple[p_idx]
        L = X_tuple[l_idx]
        GT = X_tuple[gt_idx]
        return w1 * N * P + w2 * L * P + w3 * (1 - (GT - 0.5) ** 2)

    return model


def _build_reduced_quadratic_ginic_model(feature_names):
    index_by_feature = {feature: idx for idx, feature in enumerate(feature_names)}
    required = ["N", "P", "giniC"]

    if not all(feature in index_by_feature for feature in required):
        return None

    n_idx = index_by_feature["N"]
    p_idx = index_by_feature["P"]
    gc_idx = index_by_feature["giniC"]

    def model(X_tuple, w0, w1, w2, w3, w4, w5, w6, w7):
        N = X_tuple[n_idx]
        P = X_tuple[p_idx]
        GC = X_tuple[gc_idx]
        return (
            w0 + w1 * N + w2 * P
            + w3 * (N ** 2) + w4 * (P ** 2) + w5 * N * P
            - w6 * (GC - w7) ** 2
        )

    return model


def _build_full_quadratic_gini_model(feature_names):
    index_by_feature = {feature: idx for idx, feature in enumerate(feature_names)}
    required = ["N", "P", "giniC", "giniT", "giniD"]

    if not all(feature in index_by_feature for feature in required):
        return None

    n_idx = index_by_feature["N"]
    p_idx = index_by_feature["P"]
    gc_idx = index_by_feature["giniC"]
    gt_idx = index_by_feature["giniT"]
    gd_idx = index_by_feature["giniD"]

    def model(
        X_tuple,
        w0, w1, w2, w3, w4, w5,
        a_c, b_c, a_t, b_t, a_d, b_d,
        w_nc, w_nt, w_nd, w_pc, w_pt, w_pd, w_ct, w_cd, w_td,
    ):
        N = X_tuple[n_idx]
        P = X_tuple[p_idx]
        GC = X_tuple[gc_idx]
        GT = X_tuple[gt_idx]
        GD = X_tuple[gd_idx]
        return (
            w0 + w1 * N + w2 * P
            + w3 * (N ** 2) + w4 * (P ** 2) + w5 * N * P
            - a_c * (GC - b_c) ** 2
            - a_t * (GT - b_t) ** 2
            - a_d * (GD - b_d) ** 2
            + w_nc * N * GC + w_nt * N * GT + w_nd * N * GD
            + w_pc * P * GC + w_pt * P * GT + w_pd * P * GD
            + w_ct * GC * GT + w_cd * GC * GD + w_td * GT * GD
        )

    return model


def _build_poly_gini_triplet_model(feature_names):
    index_by_feature = {feature: idx for idx, feature in enumerate(feature_names)}
    required = ["N", "P", "giniC", "giniT", "giniD"]

    if not all(feature in index_by_feature for feature in required):
        return None

    n_idx = index_by_feature["N"]
    p_idx = index_by_feature["P"]
    gc_idx = index_by_feature["giniC"]
    gt_idx = index_by_feature["giniT"]
    gd_idx = index_by_feature["giniD"]

    def model(X_tuple, w0, w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11):
        N = X_tuple[n_idx]
        P = X_tuple[p_idx]
        GC = X_tuple[gc_idx]
        GT = X_tuple[gt_idx]
        GD = X_tuple[gd_idx]
        return (
            w0 + w1 * N + w2 * P
            + w3 * (N ** 2) + w4 * (P ** 2)
            + w5 * GC + w6 * (GC ** 2)
            + w7 * GT + w8 * (GT ** 2)
            + w9 * GD + w10 * (GD ** 2)
            + w11 * GT * GD
        )

    return model


def _fit_curve_model(model_name, dataset_name, model_fn, X_tuple, y_true, p0):
    params, covariance = curve_fit(model_fn, X_tuple, y_true, p0=p0, maxfev=200000)
    y_pred = model_fn(X_tuple, *params)
    metrics = calculate_fit_metrics(y_true, y_pred)

    return {
        "name": model_name,
        "dataset": dataset_name,
        "parameters": params,
        "covariance": covariance,
        "r2": metrics["r2"],
        "tau": metrics["tau"],
        "tau_pvalue": metrics["tau_pvalue"],
    }


def _format_baseline_formula(result):
    model_name = result["name"]
    feature_names = result.get("feature_names", [])
    params = result["parameters"]

    if not feature_names:
        return "N/A"

    if model_name == "linear":
        terms = [f"{coeff:+.8f}\\,{feat}" for coeff, feat in zip(params, feature_names)]
        formula_rhs = " ".join(terms)
        if formula_rhs.startswith("+"):
            formula_rhs = formula_rhs[1:]
        return (
            "```math\n"
            f"f({','.join(feature_names)})={formula_rhs}\n"
            "```"
        )

    if model_name == "quadratic":
        n_features = len(feature_names)
        intercept = params[0]
        linear = params[1:1 + n_features]
        squares = params[1 + n_features:1 + (2 * n_features)]
        interactions = params[1 + (2 * n_features):]
        interaction_pairs = list(combinations(range(n_features), 2))

        parts = [f"{intercept:.8f}"]
        parts.extend(
            f"{coeff:+.8f}\\,{feat}"
            for coeff, feat in zip(linear, feature_names)
        )
        parts.extend(
            f"{coeff:+.8f}\\,{feat}^2"
            for coeff, feat in zip(squares, feature_names)
        )
        parts.extend(
            f"{coeff:+.8f}\\,{feature_names[i]}\\,{feature_names[j]}"
            for coeff, (i, j) in zip(interactions, interaction_pairs)
        )

        return (
            "```math\n"
            f"f({','.join(feature_names)})={''.join(parts)}\n"
            "```"
        )

    if model_name == "testFunction":
        a, b, c, d, e, f, g = params
        return (
            "```math\n"
            f"f(N,U,P,L,giniT)={a:.8f}\\,N\\,P{b:+.8f}\\,e^{{{c:.8f}\\,L\\,P}}"
            f"{d:+.8f}\\,U\\,L\\,(1{(-e):+.8f}\\,L){f:+.8f}\\,giniT\\,(1{(-g):+.8f}/N)\n"
            "```"
        )

    if model_name == "expGiniTPreference":
        w1, w2, w3 = params
        return (
            "```math\n"
            f"f(N,P,L,giniT)={w1:.8f}\\,N\\,P{w2:+.8f}\\,L\\,P"
            f"{w3:+.8f}\\,(1-(giniT-0.5)^2)\n"
            "```"
        )

    if model_name == "reducedQuadraticGiniC":
        w0, w1, w2, w3, w4, w5, w6, w7 = params
        return (
            "```math\n"
            f"f(N,P,giniC)={w0:.8f}{w1:+.8f}\\,N{w2:+.8f}\\,P"
            f"{w3:+.8f}\\,N^2{w4:+.8f}\\,P^2{w5:+.8f}\\,N\\,P"
            f"-{w6:.8f}\\,(giniC-{w7:.8f})^2\n"
            "```"
        )

    if model_name == "fullQuadraticGini":
        (
            w0, w1, w2, w3, w4, w5,
            a_c, b_c, a_t, b_t, a_d, b_d,
            w_nc, w_nt, w_nd, w_pc, w_pt, w_pd, w_ct, w_cd, w_td,
        ) = params
        return (
            "```math\n"
            "\\begin{aligned}\n"
            f"f(N,P,giniC,giniT,giniD)=&{w0:.8f}{w1:+.8f}\\,N{w2:+.8f}\\,P"
            f"{w3:+.8f}\\,N^2{w4:+.8f}\\,P^2{w5:+.8f}\\,N\\,P\\\\\n"
            f"&-{a_c:.8f}\\,(giniC-{b_c:.8f})^2\\\\\n"
            f"&-{a_t:.8f}\\,(giniT-{b_t:.8f})^2\\\\\n"
            f"&-{a_d:.8f}\\,(giniD-{b_d:.8f})^2\\\\\n"
            f"&{w_nc:+.8f}\\,N\\,giniC{w_nt:+.8f}\\,N\\,giniT{w_nd:+.8f}\\,N\\,giniD\\\\\n"
            f"&{w_pc:+.8f}\\,P\\,giniC{w_pt:+.8f}\\,P\\,giniT{w_pd:+.8f}\\,P\\,giniD\\\\\n"
            f"&{w_ct:+.8f}\\,giniC\\,giniT{w_cd:+.8f}\\,giniC\\,giniD{w_td:+.8f}\\,giniT\\,giniD\n"
            "\\end{aligned}\n"
            "```"
        )

    if model_name == "polyGiniTriplet":
        w0, w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11 = params
        return (
            "```math\n"
            "\\begin{aligned}\n"
            f"f(N,P,giniC,giniT,giniD)=&{w0:.8f}{w1:+.8f}\\,N{w2:+.8f}\\,P\\\\\n"
            f"&{w3:+.8f}\\,N^2{w4:+.8f}\\,P^2\\\\\n"
            f"&{w5:+.8f}\\,giniC{w6:+.8f}\\,giniC^2\\\\\n"
            f"&{w7:+.8f}\\,giniT{w8:+.8f}\\,giniT^2\\\\\n"
            f"&{w9:+.8f}\\,giniD{w10:+.8f}\\,giniD^2\\\\\n"
            f"&{w11:+.8f}\\,(giniT\\cdot giniD)\n"
            "\\end{aligned}\n"
            "```"
        )

    return "N/A"


def run_curve_fit_baselines():
    print("\n Starting compact curve_fit baseline runs")
    results = []

    for dataset_name, dataset_info in DATASETS.items():
        dataset_x = dataset_info["x"]
        n_features = dataset_x.shape[1]
        X_tuple = _as_tuple_matrix(dataset_x)

        print(f"\n Dataset: {dataset_name} ({n_features} features)")

        exp_gt_fn = _build_exp_ginit_preference_model(dataset_info["features"])
        if exp_gt_fn is not None:
            exp_gt_result = _fit_curve_model(
                model_name="expGiniTPreference",
                dataset_name=dataset_name,
                model_fn=exp_gt_fn,
                X_tuple=X_tuple,
                y_true=y,
                p0=np.array([1.0, 1.0, 0.1]),
            )
            exp_gt_result["feature_names"] = dataset_info["features"]
            print(
                f"  expGiniTPreference -> R^2={exp_gt_result['r2']:.4f}, "
                f"tau={exp_gt_result['tau']:.4f} (p={exp_gt_result['tau_pvalue']:.4g})"
            )
            results.append(exp_gt_result)

        reduced_quad_gc_fn = _build_reduced_quadratic_ginic_model(dataset_info["features"])
        if reduced_quad_gc_fn is not None:
            reduced_quad_gc_result = _fit_curve_model(
                model_name="reducedQuadraticGiniC",
                dataset_name=dataset_name,
                model_fn=reduced_quad_gc_fn,
                X_tuple=X_tuple,
                y_true=y,
                p0=np.array([0.0, 1.0, 1.0, 0.1, 0.1, 0.1, 1.0, 0.5]),
            )
            reduced_quad_gc_result["feature_names"] = dataset_info["features"]
            print(
                f"  reducedQuadraticGiniC -> R^2={reduced_quad_gc_result['r2']:.4f}, "
                f"tau={reduced_quad_gc_result['tau']:.4f} (p={reduced_quad_gc_result['tau_pvalue']:.4g})"
            )
            results.append(reduced_quad_gc_result)

        full_quad_gini_fn = _build_full_quadratic_gini_model(dataset_info["features"])
        if full_quad_gini_fn is not None:
            full_quad_gini_result = _fit_curve_model(
                model_name="fullQuadraticGini",
                dataset_name=dataset_name,
                model_fn=full_quad_gini_fn,
                X_tuple=X_tuple,
                y_true=y,
                p0=np.array([
                    0.0, 1.0, 1.0, 0.1, 0.1, 0.1,
                    1.0, 0.5, 1.0, 0.5, 1.0, 0.5,
                    0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
                ]),
            )
            full_quad_gini_result["feature_names"] = dataset_info["features"]
            print(
                f"  fullQuadraticGini -> R^2={full_quad_gini_result['r2']:.4f}, "
                f"tau={full_quad_gini_result['tau']:.4f} (p={full_quad_gini_result['tau_pvalue']:.4g})"
            )
            results.append(full_quad_gini_result)

        poly_gini_triplet_fn = _build_poly_gini_triplet_model(dataset_info["features"])
        if poly_gini_triplet_fn is not None:
            poly_gini_triplet_result = _fit_curve_model(
                model_name="polyGiniTriplet",
                dataset_name=dataset_name,
                model_fn=poly_gini_triplet_fn,
                X_tuple=X_tuple,
                y_true=y,
                p0=np.array([0.0, 1.0, 1.0, 0.1, 0.1, 1.0, 0.1, 1.0, 0.1, 1.0, 0.1, 0.1]),
            )
            poly_gini_triplet_result["feature_names"] = dataset_info["features"]
            print(
                f"  polyGiniTriplet -> R^2={poly_gini_triplet_result['r2']:.4f}, "
                f"tau={poly_gini_triplet_result['tau']:.4f} (p={poly_gini_triplet_result['tau_pvalue']:.4g})"
            )
            results.append(poly_gini_triplet_result)

    lines = ["## curve_fit baseline results (fair comparison vs PySR)", ""]
    for result in results:
        lines.append(f"### {result['dataset']} - {result['name']}")
        lines.append(f"R^2 Score: {result['r2']:.4f}")
        lines.append(
            f"Kendall tau: {result['tau']:.4f} (p={result['tau_pvalue']:.4g})"
        )
        if result["name"] == "quadratic":
            quad_mode = "full (with interactions)" if result.get("interaction_terms") else "reduced (no interactions)"
            lines.append(f"Quadratic mode: {quad_mode}")
        lines.append("Formula:")
        lines.append(_format_baseline_formula(result))
        lines.append("")

    with open("curvefit_baselines.md", "w", encoding="utf-8") as file_handle:
        file_handle.write("\n".join(lines).rstrip() + "\n")

    print("\n Saved compact baseline report to 'curvefit_baselines.md'")
    return results


# Using PySR lib using Julia to find the best fitting function for the data
def functionFitting():
    print("\n Starting symbolic regression with PySR")
    model_kwargs = dict(
        niterations=2500, # Number of iterations for evolutionary algorithm
        populations=10,   # Number of parallel populations to evolve                 
        population_size=60, # Number of candidate equations in each population
        model_selection="best", # Select the best model based on R² score
        maxsize=20, # Maximum size of the equations (number of nodes in the expression tree)
        maxdepth=5, # Maximum depth of the expression tree (controls complexity)
        parsimony=0.001, # Penalize complexity                
        binary_operators=["+", "*", "-", "/"],
        unary_operators=["exp"],
        complexity_of_variables=1,
        verbosity=1,
    )

    datasets = [(dataset_name, dataset_info["x"]) for dataset_name, dataset_info in DATASETS.items()]

    all_results = {}
    best_overall = None

    for dataset_name, dataset_x in datasets:
        print(f"\n Starting dataset: {dataset_name}")
        run_results = []

        for seed in range(20):
            print(f"\n Running PySR seed {seed} on {dataset_name}")
            model = PySRRegressor(
                **model_kwargs,
                random_state=seed,
            )
            model.fit(dataset_x, y)
            predictions = model.predict(dataset_x)
            metrics = calculate_fit_metrics(y, predictions)
            sympy_formula = str(model.sympy())

            run_results.append({
                "seed": seed,
                "r2": metrics["r2"],
                "tau": metrics["tau"],
                "tau_pvalue": metrics["tau_pvalue"],
                "formula": sympy_formula,
                "model": model,
                "dataset": dataset_name,
                "dataset_x": dataset_x,
            })

        run_results.sort(key=lambda item: item["r2"], reverse=True)
        all_results[dataset_name] = run_results

        if best_overall is None or run_results[0]["r2"] > best_overall["r2"]:
            best_overall = run_results[0]

    lines = ["# Top 5 PySR Fits Per Dataset", ""]
    for dataset_name, _ in datasets:
        top_five = all_results[dataset_name][:5]
        lines.append(f"## Dataset: {dataset_name}")
        lines.append("")

        for rank, result in enumerate(top_five, start=1):
            lines.append(f"### Rank {rank}")
            lines.append(f"Seed: {result['seed']}")
            lines.append(f"R^2 Score: {result['r2']:.4f}")
            lines.append(f"Kendall tau: {result['tau']:.4f} (p={result['tau_pvalue']:.4g})")
            lines.append("Formula:")
            lines.append("```text")
            lines.append(result["formula"])
            lines.append("```")
            lines.append("")

    with open("pysr_top5_models.md", "w", encoding="utf-8") as file_handle:
        file_handle.write("\n".join(lines).rstrip() + "\n")

    best_model = best_overall["model"]
    best_dataset_name = best_overall["dataset"]
    best_dataset_x = best_overall["dataset_x"]

    print("\n Done training all datasets, now evaluating global best")
    print("\n Best fitting Fnuction:")
    print(best_model.sympy())
    print(f"\nDataset: {best_dataset_name}")
    print(f"\nR² Score: {best_overall['r2']:.4f}")
    print(f"\nKendall tau: {best_overall['tau']:.4f} (p={best_overall['tau_pvalue']:.4g})")
    print("\n Saved top 5 models per dataset to 'pysr_top5_models.md'")

    print("\n Plotting results vs predictions")
    predictions = best_model.predict(best_dataset_x)

    print("\n Show all models found")
    print(best_model.equations)


def main():
    # functionFitting()
    run_curve_fit_baselines()

if __name__ == "__main__":
    main()