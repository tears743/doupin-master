// 拼豆色卡数据配置文件
// 此文件用于管理不同品牌的色号数据。
// 您可以根据需要修改各个品牌的 colors 数组，填入真实的色值。

import { MARD_221_COLORS } from "./mard221.js";

// ==========================================
// 1. 基础色卡数据定义 (Base Color Definitions)
// ==========================================

// Perler 基础色卡
const PERLER_COLORS = [
  {
    id: "P01",
    brand: "Perler",
    name: "White",
    rgb: [255, 255, 255],
    hex: "#FFFFFF",
  },
  {
    id: "P02",
    brand: "Perler",
    name: "Cream",
    rgb: [229, 214, 196],
    hex: "#E5D6C4",
  },
  {
    id: "P03",
    brand: "Perler",
    name: "Yellow",
    rgb: [247, 229, 36],
    hex: "#F7E524",
  },
  {
    id: "P04",
    brand: "Perler",
    name: "Orange",
    rgb: [255, 117, 20],
    hex: "#FF7514",
  },
  {
    id: "P05",
    brand: "Perler",
    name: "Red",
    rgb: [214, 47, 56],
    hex: "#D62F38",
  },
  {
    id: "P06",
    brand: "Perler",
    name: "Bubblegum",
    rgb: [238, 107, 166],
    hex: "#EE6BA6",
  },
  {
    id: "P07",
    brand: "Perler",
    name: "Purple",
    rgb: [110, 64, 154],
    hex: "#6E409A",
  },
  {
    id: "P08",
    brand: "Perler",
    name: "Dark Blue",
    rgb: [36, 61, 143],
    hex: "#243D8F",
  },
  {
    id: "P09",
    brand: "Perler",
    name: "Light Blue",
    rgb: [58, 170, 226],
    hex: "#3AAAE2",
  },
  {
    id: "P10",
    brand: "Perler",
    name: "Green",
    rgb: [69, 172, 86],
    hex: "#45AC56",
  },
  {
    id: "P11",
    brand: "Perler",
    name: "Light Brown",
    rgb: [143, 108, 62],
    hex: "#8F6C3E",
  },
  {
    id: "P12",
    brand: "Perler",
    name: "Brown",
    rgb: [83, 56, 43],
    hex: "#53382B",
  },
  {
    id: "P13",
    brand: "Perler",
    name: "Grey",
    rgb: [136, 138, 141],
    hex: "#888A8D",
  },
  {
    id: "P14",
    brand: "Perler",
    name: "Black",
    rgb: [34, 34, 34],
    hex: "#222222",
  },
  {
    id: "P17",
    brand: "Perler",
    name: "Dark Grey",
    rgb: [68, 69, 70],
    hex: "#444546",
  },
  {
    id: "P18",
    brand: "Perler",
    name: "Peach",
    rgb: [245, 204, 185],
    hex: "#F5CCB9",
  },
  {
    id: "P19",
    brand: "Perler",
    name: "Clear",
    rgb: [225, 225, 230],
    hex: "#E1E1E6",
  },
  {
    id: "P20",
    brand: "Perler",
    name: "Rust",
    rgb: [142, 46, 32],
    hex: "#8E2E20",
  },
  {
    id: "P21",
    brand: "Perler",
    name: "Light Brown",
    rgb: [168, 114, 69],
    hex: "#A87245",
  },
  {
    id: "P22",
    brand: "Perler",
    name: "Tan",
    rgb: [209, 159, 115],
    hex: "#D19F73",
  },
  {
    id: "P33",
    brand: "Perler",
    name: "Cheddar",
    rgb: [247, 169, 44],
    hex: "#F7A92C",
  },
  {
    id: "P35",
    brand: "Perler",
    name: "Hot Coral",
    rgb: [255, 78, 86],
    hex: "#FF4E56",
  },
  {
    id: "P36",
    brand: "Perler",
    name: "Raspberry",
    rgb: [176, 43, 86],
    hex: "#B02B56",
  },
  {
    id: "P38",
    brand: "Perler",
    name: "Kiwi Lime",
    rgb: [108, 194, 74],
    hex: "#6CC24A",
  },
  {
    id: "P39",
    brand: "Perler",
    name: "Turquoise",
    rgb: [0, 142, 176],
    hex: "#008EB0",
  },
  {
    id: "P41",
    brand: "Perler",
    name: "Dark Green",
    rgb: [17, 87, 52],
    hex: "#115734",
  },
  {
    id: "P45",
    brand: "Perler",
    name: "Parrot Green",
    rgb: [0, 140, 68],
    hex: "#008C44",
  },
  {
    id: "P48",
    brand: "Perler",
    name: "Pastel Lavender",
    rgb: [168, 140, 196],
    hex: "#A88CC4",
  },
  {
    id: "P49",
    brand: "Perler",
    name: "Plum",
    rgb: [130, 48, 107],
    hex: "#82306B",
  },
  {
    id: "P51",
    brand: "Perler",
    name: "Butterscotch",
    rgb: [219, 156, 68],
    hex: "#DB9C44",
  },
  {
    id: "P53",
    brand: "Perler",
    name: "Sand",
    rgb: [228, 194, 151],
    hex: "#E4C297",
  },
  {
    id: "P54",
    brand: "Perler",
    name: "Pastel Yellow",
    rgb: [250, 241, 140],
    hex: "#FAF18C",
  },
  {
    id: "P56",
    brand: "Perler",
    name: "Gold Metallic",
    rgb: [178, 142, 54],
    hex: "#B28E36",
  },
  {
    id: "P57",
    brand: "Perler",
    name: "Teddy Bear Brown",
    rgb: [102, 69, 45],
    hex: "#66452D",
  },
  {
    id: "P58",
    brand: "Perler",
    name: "Toothpaste",
    rgb: [169, 227, 232],
    hex: "#A9E3E8",
  },
  {
    id: "P59",
    brand: "Perler",
    name: "Hot Pink",
    rgb: [245, 45, 114],
    hex: "#F52D72",
  },
  {
    id: "P60",
    brand: "Perler",
    name: "Plum",
    rgb: [181, 74, 133],
    hex: "#B54A85",
  },
  {
    id: "P61",
    brand: "Perler",
    name: "Kiwi",
    rgb: [95, 186, 70],
    hex: "#5FBA46",
  },
  {
    id: "P62",
    brand: "Perler",
    name: "Turquoise",
    rgb: [48, 178, 199],
    hex: "#30B2C7",
  },
  {
    id: "P63",
    brand: "Perler",
    name: "Blush",
    rgb: [255, 161, 143],
    hex: "#FFA18F",
  },
  {
    id: "P70",
    brand: "Perler",
    name: "Apricot",
    rgb: [255, 193, 145],
    hex: "#FFC191",
  },
  {
    id: "P79",
    brand: "Perler",
    name: "Light Grey",
    rgb: [189, 190, 192],
    hex: "#BDBEC0",
  },
  {
    id: "P82",
    brand: "Perler",
    name: "Evergreen",
    rgb: [36, 68, 56],
    hex: "#244438",
  },
  {
    id: "P83",
    brand: "Perler",
    name: "Cobalt",
    rgb: [0, 88, 161],
    hex: "#0058A1",
  },
  {
    id: "P85",
    brand: "Perler",
    name: "Cucumber",
    rgb: [167, 203, 158],
    hex: "#A7CB9E",
  },
  {
    id: "P88",
    brand: "Perler",
    name: "Toasted Marshmallow",
    rgb: [235, 219, 207],
    hex: "#EBDBCF",
  },
  {
    id: "P90",
    brand: "Perler",
    name: "Butter",
    rgb: [252, 237, 107],
    hex: "#FCED6B",
  },
  {
    id: "P92",
    brand: "Perler",
    name: "Slate Grey",
    rgb: [79, 81, 87],
    hex: "#4F5157",
  },
  {
    id: "P96",
    brand: "Perler",
    name: "Fern",
    rgb: [65, 122, 69],
    hex: "#417A45",
  },
  {
    id: "P98",
    brand: "Perler",
    name: "Tomato",
    rgb: [224, 60, 48],
    hex: "#E03C30",
  },
  {
    id: "P99",
    brand: "Perler",
    name: "Midnight",
    rgb: [20, 29, 61],
    hex: "#141D3D",
  },
  {
    id: "P100",
    brand: "Perler",
    name: "Cotton Candy",
    rgb: [247, 172, 191],
    hex: "#F7ACBF",
  },
];

// Artkal S系列基础色卡
const ARTKAL_S_COLORS = [
  {
    id: "S01",
    brand: "Artkal",
    name: "White",
    rgb: [233, 231, 230],
    hex: "#E9E7E6",
  },
  {
    id: "S02",
    brand: "Artkal",
    name: "Black",
    rgb: [31, 31, 33],
    hex: "#1F1F21",
  },
  {
    id: "S03",
    brand: "Artkal",
    name: "Light Grey",
    rgb: [163, 167, 169],
    hex: "#A3A7A9",
  },
  {
    id: "S04",
    brand: "Artkal",
    name: "Grey",
    rgb: [142, 143, 147],
    hex: "#8E8F93",
  },
  {
    id: "S05",
    brand: "Artkal",
    name: "Dark Grey",
    rgb: [88, 92, 99],
    hex: "#585C63",
  },
  {
    id: "S06",
    brand: "Artkal",
    name: "Red",
    rgb: [221, 52, 68],
    hex: "#DD3444",
  },
  {
    id: "S07",
    brand: "Artkal",
    name: "Pastel Red",
    rgb: [254, 144, 143],
    hex: "#FE908F",
  },
  {
    id: "S08",
    brand: "Artkal",
    name: "Dark Red",
    rgb: [194, 41, 51],
    hex: "#C22933",
  },
  {
    id: "S09",
    brand: "Artkal",
    name: "Coral",
    rgb: [250, 97, 106],
    hex: "#FA616A",
  },
  {
    id: "S10",
    brand: "Artkal",
    name: "Orange",
    rgb: [253, 97, 73],
    hex: "#FD6149",
  },
  {
    id: "S11",
    brand: "Artkal",
    name: "Pastel Orange",
    rgb: [254, 164, 2],
    hex: "#FEA402",
  },
  {
    id: "S12",
    brand: "Artkal",
    name: "Neon Orange",
    rgb: [255, 116, 5],
    hex: "#FF7405",
  },
  {
    id: "S13",
    brand: "Artkal",
    name: "Yellow",
    rgb: [240, 206, 1],
    hex: "#F0CE01",
  },
  {
    id: "S14",
    brand: "Artkal",
    name: "Pastel Yellow",
    rgb: [240, 226, 79],
    hex: "#F0E24F",
  },
  {
    id: "S15",
    brand: "Artkal",
    name: "Gold",
    rgb: [233, 181, 4],
    hex: "#E9B504",
  },
  {
    id: "S16",
    brand: "Artkal",
    name: "Neon Yellow",
    rgb: [242, 243, 60],
    hex: "#F2F33C",
  },
  {
    id: "S17",
    brand: "Artkal",
    name: "Dark Green",
    rgb: [42, 93, 98],
    hex: "#2A5D62",
  },
  {
    id: "S18",
    brand: "Artkal",
    name: "Green",
    rgb: [84, 145, 96],
    hex: "#549160",
  },
  {
    id: "S19",
    brand: "Artkal",
    name: "Pastel Green",
    rgb: [132, 197, 81],
    hex: "#84C551",
  },
  {
    id: "S20",
    brand: "Artkal",
    name: "Emerald",
    rgb: [82, 204, 106],
    hex: "#52CC6A",
  },
  {
    id: "S21",
    brand: "Artkal",
    name: "Neon Green",
    rgb: [1, 198, 62],
    hex: "#01C63E",
  },
  {
    id: "S22",
    brand: "Artkal",
    name: "Mint",
    rgb: [147, 202, 135],
    hex: "#93CA87",
  },
  {
    id: "S23",
    brand: "Artkal",
    name: "Dark Blue",
    rgb: [40, 68, 146],
    hex: "#284492",
  },
  {
    id: "S24",
    brand: "Artkal",
    name: "Blue",
    rgb: [57, 109, 188],
    hex: "#396DBC",
  },
  {
    id: "S25",
    brand: "Artkal",
    name: "Light Blue",
    rgb: [26, 117, 208],
    hex: "#1A75D0",
  },
  {
    id: "S26",
    brand: "Artkal",
    name: "Sky Blue",
    rgb: [164, 200, 232],
    hex: "#A4C8E8",
  },
  {
    id: "S27",
    brand: "Artkal",
    name: "Baby Blue",
    rgb: [97, 168, 223],
    hex: "#61A8DF",
  },
  {
    id: "S28",
    brand: "Artkal",
    name: "Dark Purple",
    rgb: [85, 72, 137],
    hex: "#554889",
  },
  {
    id: "S29",
    brand: "Artkal",
    name: "Purple",
    rgb: [125, 102, 173],
    hex: "#7D66AD",
  },
  {
    id: "S30",
    brand: "Artkal",
    name: "Pastel Purple",
    rgb: [137, 98, 173],
    hex: "#8962AD",
  },
  {
    id: "S31",
    brand: "Artkal",
    name: "Lavender",
    rgb: [166, 117, 191],
    hex: "#A675BF",
  },
  {
    id: "S32",
    brand: "Artkal",
    name: "Light Lavender",
    rgb: [192, 174, 219],
    hex: "#C0AEDB",
  },
  {
    id: "S33",
    brand: "Artkal",
    name: "Brown",
    rgb: [120, 88, 78],
    hex: "#78584E",
  },
  {
    id: "S34",
    brand: "Artkal",
    name: "Light Brown",
    rgb: [89, 71, 67],
    hex: "#594743",
  },
  {
    id: "S35",
    brand: "Artkal",
    name: "Sand",
    rgb: [206, 155, 134],
    hex: "#CE9B86",
  },
  {
    id: "S36",
    brand: "Artkal",
    name: "Tan",
    rgb: [175, 150, 102],
    hex: "#AF9666",
  },
  {
    id: "S37",
    brand: "Artkal",
    name: "Bubblegum",
    rgb: [237, 174, 172],
    hex: "#EDAEAC",
  },
  {
    id: "S38",
    brand: "Artkal",
    name: "Hot Pink",
    rgb: [254, 91, 186],
    hex: "#FE5BBA",
  },
  {
    id: "S39",
    brand: "Artkal",
    name: "Magenta",
    rgb: [254, 66, 137],
    hex: "#FE4289",
  },
  {
    id: "S40",
    brand: "Artkal",
    name: "Pink",
    rgb: [223, 159, 205],
    hex: "#DF9FCD",
  },
  {
    id: "S41",
    brand: "Artkal",
    name: "Light Pink",
    rgb: [249, 188, 193],
    hex: "#F9BCC1",
  },
  {
    id: "S42",
    brand: "Artkal",
    name: "Old Pink",
    rgb: [200, 103, 130],
    hex: "#C86782",
  },
  {
    id: "S43",
    brand: "Artkal",
    name: "Burgundy",
    rgb: [161, 48, 83],
    hex: "#A13053",
  },
  {
    id: "S44",
    brand: "Artkal",
    name: "Blue Green",
    rgb: [132, 199, 198],
    hex: "#84C7C6",
  },
  {
    id: "S45",
    brand: "Artkal",
    name: "Turquoise",
    rgb: [101, 147, 223],
    hex: "#6593DF",
  },
  {
    id: "S46",
    brand: "Artkal",
    name: "Dark Olive",
    rgb: [124, 137, 52],
    hex: "#7C8934",
  },
  {
    id: "S47",
    brand: "Artkal",
    name: "Pistachio",
    rgb: [160, 213, 137],
    hex: "#A0D589",
  },
  {
    id: "S48",
    brand: "Artkal",
    name: "Green Tea",
    rgb: [56, 112, 97],
    hex: "#387061",
  },
  {
    id: "S49",
    brand: "Artkal",
    name: "Dark Algae",
    rgb: [146, 183, 1],
    hex: "#92B701",
  },
  {
    id: "S50",
    brand: "Artkal",
    name: "Jade Green",
    rgb: [49, 131, 50],
    hex: "#318332",
  },
  {
    id: "S51",
    brand: "Artkal",
    name: "Shadow Green",
    rgb: [161, 198, 206],
    hex: "#A1C6CE",
  },
  {
    id: "S52",
    brand: "Artkal",
    name: "Sea Mist",
    rgb: [171, 218, 202],
    hex: "#ABDACA",
  },
  {
    id: "S53",
    brand: "Artkal",
    name: "Light Sea Blue",
    rgb: [119, 191, 209],
    hex: "#77BFD1",
  },
  {
    id: "S54",
    brand: "Artkal",
    name: "Steel Blue",
    rgb: [91, 159, 199],
    hex: "#5B9FC7",
  },
  {
    id: "S55",
    brand: "Artkal",
    name: "Azure",
    rgb: [64, 144, 192],
    hex: "#4090C0",
  },
  {
    id: "S56",
    brand: "Artkal",
    name: "Dark Steel Blue",
    rgb: [56, 121, 166],
    hex: "#3879A6",
  },
  {
    id: "S57",
    brand: "Artkal",
    name: "Sea Blue",
    rgb: [59, 135, 171],
    hex: "#3B87AB",
  },
  {
    id: "S58",
    brand: "Artkal",
    name: "Ghost White",
    rgb: [211, 211, 208],
    hex: "#D3D3D0",
  },
  {
    id: "S59",
    brand: "Artkal",
    name: "Ash Gray",
    rgb: [189, 189, 187],
    hex: "#BDBDBB",
  },
  {
    id: "S60",
    brand: "Artkal",
    name: "Deer",
    rgb: [184, 138, 98],
    hex: "#B88A62",
  },
  {
    id: "S61",
    brand: "Artkal",
    name: "Clay",
    rgb: [145, 106, 77],
    hex: "#916A4D",
  },
  {
    id: "S62",
    brand: "Artkal",
    name: "Sienna",
    rgb: [174, 103, 53],
    hex: "#AE6735",
  },
  {
    id: "S63",
    brand: "Artkal",
    name: "Copper",
    rgb: [157, 91, 46],
    hex: "#9D5B2E",
  },
  {
    id: "S64",
    brand: "Artkal",
    name: "Bronze",
    rgb: [105, 96, 70],
    hex: "#696046",
  },
  {
    id: "S65",
    brand: "Artkal",
    name: "Silver",
    rgb: [103, 107, 115],
    hex: "#676B73",
  },
  {
    id: "S66",
    brand: "Artkal",
    name: "Gray 3",
    rgb: [102, 103, 106],
    hex: "#66676A",
  },
  {
    id: "S67",
    brand: "Artkal",
    name: "Black Rock",
    rgb: [54, 61, 92],
    hex: "#363D5C",
  },
  {
    id: "S68",
    brand: "Artkal",
    name: "Mine Shaft",
    rgb: [67, 72, 78],
    hex: "#43484E",
  },
  {
    id: "S69",
    brand: "Artkal",
    name: "Beeswax",
    rgb: [248, 197, 131],
    hex: "#F8C583",
  },
  {
    id: "S70",
    brand: "Artkal",
    name: "Vanilla",
    rgb: [226, 193, 178],
    hex: "#E2C1B2",
  },
  {
    id: "S71",
    brand: "Artkal",
    name: "Spring Sun",
    rgb: [243, 217, 182],
    hex: "#F3D9B6",
  },
  {
    id: "S72",
    brand: "Artkal",
    name: "Sandstorm",
    rgb: [239, 221, 6],
    hex: "#EFDD06",
  },
  {
    id: "S73",
    brand: "Artkal",
    name: "Corn",
    rgb: [246, 191, 5],
    hex: "#F6BF05",
  },
  {
    id: "S74",
    brand: "Artkal",
    name: "Marigold",
    rgb: [156, 116, 60],
    hex: "#9C743C",
  },
  {
    id: "S75",
    brand: "Artkal",
    name: "Yellow Orange",
    rgb: [255, 131, 75],
    hex: "#FF834B",
  },
  {
    id: "S76",
    brand: "Artkal",
    name: "Outrageous Orange",
    rgb: [254, 127, 80],
    hex: "#FE7F50",
  },
  {
    id: "S77",
    brand: "Artkal",
    name: "Paprika",
    rgb: [172, 44, 68],
    hex: "#AC2C44",
  },
  {
    id: "S78",
    brand: "Artkal",
    name: "Redwood",
    rgb: [124, 69, 69],
    hex: "#7C4545",
  },
  {
    id: "S79",
    brand: "Artkal",
    name: "Deep Chestnut",
    rgb: [165, 87, 97],
    hex: "#A55761",
  },
  {
    id: "S80",
    brand: "Artkal",
    name: "Red Wine",
    rgb: [140, 65, 74],
    hex: "#8C414A",
  },
  {
    id: "S81",
    brand: "Artkal",
    name: "Buccaneer",
    rgb: [152, 78, 67],
    hex: "#984E43",
  },
  {
    id: "S82",
    brand: "Artkal",
    name: "Mulberry Wood",
    rgb: [120, 49, 90],
    hex: "#78315A",
  },
  {
    id: "S83",
    brand: "Artkal",
    name: "Raspberry Pink",
    rgb: [235, 102, 190],
    hex: "#EB66BE",
  },
  {
    id: "S84",
    brand: "Artkal",
    name: "Carnation Pink",
    rgb: [253, 145, 214],
    hex: "#FD91D6",
  },
  {
    id: "S85",
    brand: "Artkal",
    name: "Mandys Pink",
    rgb: [253, 164, 126],
    hex: "#FDA47E",
  },
  {
    id: "S86",
    brand: "Artkal",
    name: "Pearl White",
    rgb: [224, 219, 202],
    hex: "#E0DBCA",
  },
  {
    id: "S87",
    brand: "Artkal",
    name: "Picasso",
    rgb: [239, 229, 109],
    hex: "#EFE56D",
  },
  {
    id: "S88",
    brand: "Artkal",
    name: "Key Lemon Pie",
    rgb: [187, 197, 40],
    hex: "#BBC528",
  },
  {
    id: "S89",
    brand: "Artkal",
    name: "Bright Green",
    rgb: [168, 228, 42],
    hex: "#A8E42A",
  },
  {
    id: "S90",
    brand: "Artkal",
    name: "Medium Turquoise",
    rgb: [63, 152, 158],
    hex: "#3F989E",
  },
  {
    id: "S91",
    brand: "Artkal",
    name: "Brunswick Green",
    rgb: [52, 64, 66],
    hex: "#344042",
  },
  {
    id: "S92",
    brand: "Artkal",
    name: "Glow Green",
    rgb: [190, 198, 150],
    hex: "#BEC696",
  },
  {
    id: "S93",
    brand: "Artkal",
    name: "Glow Blue",
    rgb: [111, 173, 193],
    hex: "#6FADC1",
  },
  {
    id: "S94",
    brand: "Artkal",
    name: "Glow Pink",
    rgb: [223, 171, 188],
    hex: "#DFABBC",
  },
  {
    id: "S95",
    brand: "Artkal",
    name: "Glow Yellow",
    rgb: [198, 192, 180],
    hex: "#C6C0B4",
  },
];

// ==========================================
// 2. 品牌配置 (Brand Configurations)
// ==========================================
// 您可以在此处添加或修改品牌配置，包括品牌名称、ID、以及包含的色包 (sets)。

export const BRAND_CONFIG = {
  Perler: {
    name: "Perler",
    sets: [{ id: "standard", name: "Standard", colors: PERLER_COLORS }],
  },
  Artkal: {
    name: "Artkal",
    sets: [{ id: "s-full", name: "S-Series Full", colors: ARTKAL_S_COLORS }],
  },

  // --- 用户需补充的品牌 ---
  // 下面的品牌目前暂时使用 Artkal 的色值作为占位。
  // 请在收到真实色卡数据后，替换 `colors` 属性中的内容。

  MARD: {
    name: "MARD",
    sets: [
      {
        id: "full-221",
        name: "全部色 (221色)",
        // 使用独立文件 server/data/mard221.js 中的配置
        colors: MARD_221_COLORS,
      },
      {
        id: "standard-148",
        name: "常用色 (148色)",
        // TODO: 请替换为 MARD 148 色真实数据
        colors: ARTKAL_S_COLORS.slice(0, 148).map((c) => ({
          ...c,
          brand: "MARD",
        })),
      },
      {
        id: "starter-24",
        name: "新手包 (24色)",
        colors: ARTKAL_S_COLORS.slice(0, 24).map((c) => ({
          ...c,
          brand: "MARD",
        })),
      },
    ],
  },

  Coco: {
    name: "Coco",
    sets: [
      {
        id: "full",
        name: "全套 (Full)",
        // TODO: 请替换为 Coco 真实数据
        colors: ARTKAL_S_COLORS.map((c) => ({ ...c, brand: "Coco" })),
      },
      {
        id: "basic",
        name: "基础 (Basic)",
        colors: ARTKAL_S_COLORS.slice(0, 50).map((c) => ({
          ...c,
          brand: "Coco",
        })),
      },
    ],
  },

  米小窝: {
    name: "米小窝",
    sets: [
      {
        id: "default",
        name: "默认 (Default)",
        // TODO: 请替换为 米小窝 真实数据
        colors: ARTKAL_S_COLORS.map((c) => ({ ...c, brand: "米小窝" })),
      },
    ],
  },

  漫漫: {
    name: "漫漫",
    sets: [
      {
        id: "default",
        name: "默认 (Default)",
        // TODO: 请替换为 漫漫 真实数据
        colors: ARTKAL_S_COLORS.map((c) => ({ ...c, brand: "漫漫" })),
      },
    ],
  },

  盼盼: {
    name: "盼盼",
    sets: [
      {
        id: "default",
        name: "默认 (Default)",
        // TODO: 请替换为 盼盼 真实数据
        colors: ARTKAL_S_COLORS.map((c) => ({ ...c, brand: "盼盼" })),
      },
    ],
  },
};

// ==========================================
// 3. 辅助函数 (Helper Functions)
// ==========================================

export function getAllBrands() {
  return Object.keys(BRAND_CONFIG).map((key) => ({
    name: BRAND_CONFIG[key].name,
    value: key,
    sets: BRAND_CONFIG[key].sets.map((s) => ({ name: s.name, id: s.id })),
  }));
}

export function getColors(brand, setId) {
  // 如果没有指定品牌，默认返回所有 Perler 和 Artkal 颜色 (兼容旧逻辑)
  if (!brand) {
    return [...PERLER_COLORS, ...ARTKAL_S_COLORS];
  }

  const config = BRAND_CONFIG[brand];
  if (!config) return [];

  // 如果指定了 set，返回该 set 的颜色
  if (setId) {
    const set = config.sets.find((s) => s.id === setId);
    return set ? set.colors : [];
  }

  // 如果没有指定 set，默认返回第一个 set 的颜色
  if (config.sets.length > 0) {
    return config.sets[0].colors;
  }

  return [];
}
