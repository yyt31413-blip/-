# 齐与乱 · 秩序认知交互测试

React + Vite 项目。运行 `npm install`、`npm run dev`；使用 `npm test` 和 `npm run build` 验证。

## 流程

首页 → 桌面排列 → 几何数据与五项评分 → 类型归类 → 视觉转译 → 结果页与秩序认知票据 → 重新测试。

“重新测试”会清空当前轮次的桌面、结果、类型、转译与票据并恢复初始物品。票据仅在页面展示；当前项目不提供下载或持久化保存。ORDER ID 是当前页面会话内的临时序号。

## 修改位置

| 需求 | 文件 |
| --- | --- |
| 增删文具、调整初始位置或类别 | `src/data/stationery.js` |
| 文具在可拖动桌面上的临时图形 | `src/components/ItemArtwork.jsx` |
| 桌面尺寸、中心、重叠和占据区域 | `src/utils/geometry.js` |
| 文具图层顺序与上移、下移、置顶、置底 | `src/utils/layers.js` |
| 五项评分公式 | `src/utils/scoring.js` |
| 评分阈值与权重 | `src/config/scoringConfig.js` |
| 六种类型的名称与说明 | `src/data/orderTypes.js` |
| 类型参考向量与权重 | `src/config/typeConfig.js` |
| 类型归类方法 | `src/utils/typeClassification.js` |
| 文具到几何模块的映射、对齐辅助线 | `src/utils/visualTranslation.js` |
| 几何模块的 SVG 绘制 | `src/components/TranslatedShape.jsx` |
| 测试流程与轮次重置 | `src/App.jsx` |
| 桌面指针交互 | `src/components/Desk.jsx`、`src/components/DeskItem.jsx` |
| 结果页与票据排版 | `src/components/ResultPage.jsx`、`src/components/OrderTicket.jsx` |

新增文具时先在 `stationery.js` 添加唯一 `id`、`name`、`category`、几何数据和初始 `zIndex`。初始层级会自动整理为从底到顶的连续编号。未定制图形的物品会使用默认矩形；需要专属图形时，再在 `ItemArtwork.jsx`、`visualTranslation.js` 和 `TranslatedShape.jsx` 中增加对应规则。五项评分按当前物品数组计算，不依赖固定的十件物品；图层变化不会改变评分。

当前类型参考向量与评分阈值是实验参数，后续应依据真实问卷、访谈和桌面实验数据校准。
