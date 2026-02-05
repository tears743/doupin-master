const fs = require('fs');

const rawData = `
A1	faf5cd	250, 245, 205	B1	dff13b	223, 241, 59	C1	f0fee4	240, 254, 228	D1	acb7ef	172, 183, 239
A2	fcfed6	252, 254, 214	B2	64f343	100, 243, 67	C2	abf8fe	171, 248, 254	D2	868dd3	134, 141, 211
A3	fcff92	252, 255, 146	B3	a1f586	161, 245, 134	C3	a2e0f7	162, 224, 247	D3	3554af	53, 84, 175
A4	f7ec5c	247, 236, 92	B4	5fdf34	95, 223, 52	C4	44cdfb	68, 205, 251	D4	162d7b	22, 45, 123
A5	f0d83a	240, 216, 58	B5	39e158	57, 225, 88	C5	06aadf	6, 170, 223	D5	b34ec6	179, 78, 198
A6	fda951	253, 169, 81	B6	64e0a4	100, 224, 164	C6	54a7e9	84, 167, 233	D6	b37bdc	179, 123, 220
A7	fa8c4f	250, 140, 79	B7	3eae7c	62, 174, 124	C7	3977ca	57, 119, 202	D7	8758a9	135, 88, 169
A8	fbda4d	251, 218, 77	B8	1d9b54	29, 155, 84	C8	0f52bd	15, 82, 189	D8	e3d2fe	227, 210, 254
A9	f79d5f	247, 157, 95	B9	2a5037	42, 80, 55	C9	3349c3	51, 73, 195	D9	d5b9f4	213, 185, 244
A10	f47e38	244, 126, 56	B10	9ad1ba	154, 209, 186	C10	3cbce3	60, 188, 227	D10	301a49	48, 26, 73
A11	fedb99	254, 219, 153	B11	627032	98, 112, 50	C11	2aded3	42, 222, 211	D11	beb9e2	190, 185, 226
A12	fda276	253, 162, 118	B12	1a6e3d	26, 110, 61	C12	1e334e	30, 51, 78	D12	dc99ce	220, 153, 206
A13	fec667	254, 198, 103	B13	c8e87d	200, 232, 125	C13	cde7fe	205, 231, 254	D13	b5038d	181, 3, 141
A14	f75842	247, 88, 66	B14	abe84f	171, 232, 79	C14	d5fcf7	213, 252, 247	D14	862993	134, 41, 147
A15	fbf65e	251, 246, 94	B15	305335	48, 83, 53	C15	21c5c4	33, 197, 196	D15	2f1f8c	47, 31, 140
A16	feff97	254, 255, 151	B16	c0ed9c	192, 237, 156	C16	1858a2	24, 88, 162	D16	e2e4f0	226, 228, 240
A17	fde173	253, 225, 115	B17	9eb33e	158, 179, 62	C17	02d1f3	2, 209, 243	D17	c7d3f9	199, 211, 249
A18	fcbf80	252, 191, 128	B18	e6ed4f	230, 237, 79	C18	213244	33, 50, 68	D18	9a64b8	154, 100, 184
A19	fd7e77	253, 126, 119	B19	26b78e	38, 183, 142	C19	18869d	24, 134, 157	D19	d8c2d9	216, 194, 217
A20	f9d66e	249, 214, 110	B20	cbeccf	203, 236, 207	C20	1a70a9	26, 112, 169	D20	9a35ad	154, 53, 173
A21	fae393	250, 227, 147	B21	18616a	24, 97, 106	C21	bcddfc	188, 221, 252	D21	940595	148, 5, 149
A22	edf878	237, 248, 120	B22	0a4241	10, 66, 65	C22	6bb1bb	107, 177, 187	D22	38389a	56, 56, 154
A23	e4c8ba	228, 200, 186	B23	343b1a	52, 59, 26	C23	c8e2fd	200, 226, 253	D23	eadbf8	234, 219, 248
A24	f3f6a9	243, 246, 169	B24	e8faa6	232, 250, 166	C24	7ec5f9	126, 197, 249	D24	768ae1	118, 138, 225
A25	ffd785	255, 215, 133	B25	4e846d	78, 132, 109	C25	a9e8e0	169, 232, 224	D25	4950c2	73, 80, 194
A26	ffc734	255, 199, 52	B26	907c35	144, 124, 53	C26	42adcf	66, 173, 207	D26	d6c6eb	214, 198, 235
		B27	d0e0af	208, 224, 175	C27	d0def9	208, 222, 249			
		B28	9ee5bb	158, 229, 187	C28	bdcee8	189, 206, 232			
		B29	c6df5f	198, 223, 95	C29	364a89	54, 74, 137			
		B30	e3fbb1	227, 251, 177						
		B31	b4e691	180, 230, 145						
		B32	92ad60	146, 173, 96						
`;

const lines = rawData.trim().split('\n');
const colors = [];

lines.forEach(line => {
    // Split by tabs or multiple spaces
    const parts = line.split(/\t+/).filter(p => p.trim());
    
    // Each color has 3 parts: ID, Hex, RGB
    for (let i = 0; i < parts.length; i += 3) {
        if (i + 2 < parts.length) {
            const id = parts[i].trim();
            const hex = '#' + parts[i+1].trim();
            const rgbStr = parts[i+2].trim();
            const rgb = rgbStr.split(/,\s*/).map(Number);
            
            if (id && hex && rgb.length === 3) {
                colors.push({
                    id,
                    brand: 'MARD',
                    name: id,
                    rgb,
                    hex
                });
            }
        }
    }
});

const fileContent = `// MARD 221 色 色卡数据
// 自动生成

export const MARD_221_COLORS = ${JSON.stringify(colors, null, 2)};
`;

console.log(fileContent);
