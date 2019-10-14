// https://observablehq.com/d/8c838dc72579d811@161
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Decision Tree vs Random forest`
)});
  main.variable(observer()).define(["md"], function(md){return(
md `https://observablehq.com/@d3/bubble-chart`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`
<body class="vis">
  <div class="container" id="decision"></div>
  <div class="container" id="random"></div>
</body>
`
)});
  main.variable(observer()).define(["chart"], function(chart){return(
chart()
)});
  main.variable(observer("chart")).define("chart", ["pack","data_1","d3","width","height","DOM","color"], function(pack,data_1,d3,width,height,DOM,color){return(
(data) => {
  const root = pack(data_1);
  
  const svg = d3.select("#decision")
      .append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("font-size", 20)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");

  const leaf = svg.selectAll("g")
    .data(root.leaves())
    .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  leaf.append("circle")
      .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
      .attr("r", d => d.r)
      .attr("fill-opacity", 0.7)
      .attr("fill", d => color(d.data.name));
  
  leaf.append("text")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text(d => d);
}
)});
  main.variable(observer("pack")).define("pack", ["d3","width","height"], function(d3,width,height){return(
data => d3.pack()
    .size([width - 2, height - 2])
    .padding(3)(d3.hierarchy({children: data}).sum(d => d.value))
)});
  main.variable(observer("data_1")).define("data_1", ["data"], function(data){return(
data.slice(0, data.length).map(d => {
  return {name: d.genre, value: d.numberclassified}
})
)});
  main.variable(observer("data")).define("data", ["d3"], async function(d3){return(
await d3.csv("https://raw.githubusercontent.com/KnowYourselves/Infovis-T02-Dataset/master/stats_decision_forest.csv")
)});
  main.variable(observer("color")).define("color", ["d3","data"], function(d3,data){return(
d3.scaleOrdinal(data.map(d => d.name), d3.schemeCategory10)
)});
  main.variable(observer("width")).define("width", function(){return(
932
)});
  main.variable(observer("height")).define("height", function(){return(
932
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
