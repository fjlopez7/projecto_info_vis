



const filepath = "https://raw.githubusercontent.com/KnowYourselves/Infovis-T02-Dataset/master/stats_decision_forest.csv";
const promise_1 = d3.csv(filepath);
let data;
promise_1.then(value=> {
    return value;
    });

console.log(promise_1);
const color = data => d3.scaleOrdinal(data.map(d => d.name), d3.schemeCategory10); 

const data_1 = data.slice(0, data.length).map(d => {
    return {name: d.genre, value: d.numberclassified}
  });

const pack = data => d3.pack()
            .size([width - 2, height - 2])
            .padding(3)(d3.hierarchy({children: data}).sum(d => d.value));

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