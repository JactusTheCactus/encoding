#!/usr/bin/env bash
set -euo pipefail
flag() {
	for f in "$@"; do
		[[ -e ".flags/$f" ]] || return 1
	done
}
if flag local; then
	:
else
	npm ci
fi
rm -rf dist
tsc
find ./src/ \
	-type f \
	-not \( \
		-name "*.ts" \
	\) \
	-exec cp {} dist/ \
\;
DATA=$(cat << EOF
# Hex_lo;_, Wo_x_rld!
## Ux_po_r
- [ ] A_
- [ ] B_
- [ ] C_
- [ ] D_
- [ ] E_
- [ ] F_
- [ ] G_
- [ ] H_
- [ ] I_
- [ ] J_
- [ ] K_
- [ ] L_
- [ ] M_
- [ ] N_
- [ ] O_
- [ ] P_
- [ ] Q_
- [ ] R_
- [ ] S_
- [ ] T_
- [ ] U_
- [ ] V_
- [ ] W_
- [ ] X_
- [ ] Y_
- [ ] Z_
## Lo;_x_ur
- [ ] a_
- [ ] b_
- [ ] c_
- [ ] d_
- [ ] e_
- [ ] f_
- [ ] g_
- [ ] h_
- [ ] i_
- [ ] j_
- [ ] k_
- [ ] l_
- [ ] m_
- [ ] n_
- [ ] o_
- [ ] p_
- [ ] q_
- [ ] r_
- [ ] s_
- [ ] t_
- [ ] u_
- [ ] v_
- [ ] w_
- [ ] x_
- [ ] y_
- [ ] z_
EOF
)
export DATA
cd dist
node _.js
{
	echo "$DATA"
	printf "=%.0s" {1..50}
	echo
	cat encoded.txt
} > _.log
