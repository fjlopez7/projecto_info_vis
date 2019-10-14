
// Función que crea el gráfico. Recibe la url del json y el tamaño.
const create = (url, diameter) => {
  d3.csv(url).then(data => {
    // Adaptamos el
    const dataset = {
      children: data.slice(0, data.length).map(d => {
        return { Name: d.genre, Count: d.numberclassified }
      })
    };

    // Creamos la escala de color
    color = d3.scaleOrdinal(d3.schemeCategory10);

    // Creamos pack (similar a como creamos tree en la tarea)
    bubble = d3.pack()
      .size([diameter, diameter])
      .padding(1.5);

    // Creamos los nodos usando hierarchy
    nodes = d3.hierarchy(dataset).sum(d => d.Count)

    // Creamos el SVG
    svg = d3.select("body")
      .append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");

    // Creamos los nodos
    node = svg.selectAll(".node")
      .data(bubble(nodes).descendants())
      .enter()
      .filter(d => !d.children) // Esto ignora los agrupamientos generales (comentar para ver a que me refiero)
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)

    // Les damso título (tooltip)
    node.append("title")
      .text(d => `${d.data.Name}: ${d.data.Count}`)

    // Coloreamos los círculos
    node.append("circle")
      .attr("r", d => d.r)
      .style("fill", (d, i) => color(i))

    // Escribimos el texto y el tamaño
    node.append("text")
      .attr("dy", ".2em")
      .style("text-anchor", "middle")
      .text(d => d.data.Name)
      .attr("font-family", "sans-serif")
      .attr("font-size", d => 10) // Debería ser dinámico
      .attr("fill", "white");
    
    node.append("text")
      .attr("dy", "1.3em")
      .style("text-anchor", "middle")
      .text(d => d.data.Count)
      .attr("font-family", "Gill Sans", "Gill Sans MT")
      .attr("font-size", d => 10) // Debería ser dinámico
      .attr("fill", "white");
  })
}

const filepath = "https://raw.githubusercontent.com/KnowYourselves/Infovis-T02-Dataset/master/stats_decision_forest.csv";
create(filepath, 500)