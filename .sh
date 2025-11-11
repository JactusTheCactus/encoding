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
<table>
	<tr>
		<td></td>
		<td>Aa</td>
		<td>Bb</td>
		<td>Cc</td>
		<td>Dd</td>
		<td>Ee</td>
		<td>Ff</td>
		<td>Gg</td>
		<td>Hh</td>
		<td>Ii</td>
		<td>Jj</td>
		<td>Kk</td>
		<td>Ll</td>
		<td>Mm</td>
		<td>Nn</td>
		<td>Oo</td>
		<td>Pp</td>
		<td>Qq</td>
		<td>Rr</td>
		<td>Ss</td>
		<td>Tt</td>
		<td>Uu</td>
		<td>Vv</td>
		<td>Ww</td>
		<td>Xx</td>
		<td>Yy</td>
		<td>Zz</td>
	</tr>
	<tr>
		{Ma_x_dz_e_s_kjul} (Majuscule)
		[A_]
		[B_]
		[C_]
		[D_]
		[E_]
		[F_]
		[G_]
		[H_]
		[I_]
		[J_]
		[K_]
		[L_]
		[M_]
		[N_]
		[O_]
		[P_]
		[Q_]
		[R_]
		[S_]
		[T_]
		[U_]
		[V_]
		[W_]
		[X_] (For Diacritics)
		[Y_]
		[Z_]
	</tr>
	<tr>
		{Mix_ne_s_kjul} (Minuscule)
		[a_]
		[b_]
		[c_]
		[d_]
		[e_]
		[f_]
		[g_]
		[h_]
		[i_]
		[j_]
		[k_]
		[l_]
		[m_]
		[n_]
		[o_]
		[p_]
		[q_]
		[r_]
		[s_]
		[t_]
		[u_]
		[v_]
		[w_]
		[x_] (Emphasis (Only placed on vowels))
		[y_]
		[z_]
	</tr>
</table>
EOF
)
export DATA
cd dist
node _.js
{
	echo "$DATA"
	printf "=%.0s" {1..50}
	echo
	cat encoded.log
} > _.log
DIR="../dist"
find "$DIR" \
	-type f \
	-not \( \
		-wholename "$DIR/encoded/*" -o \
		-name "encoding.yml" -o \
		-name "uni.yml" -o \
		-name "_.js" -o \
		-name "_.log" -o \
		-name "encoded.log" \
	\) | while IFS= read -r file; do
	echo "${file#$DIR/}"
	FILE="$file"
	export FILE
	node _.js
	# cat "$file" | grep '{404}'
done
