const parse_name = (name) => name.split(" ").join("-")

// Función que crea el gráfico. Recibe la url del json, el tamaño y el tipo.
const create = (url, diameter, type) => {
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
    const svg = d3.select(`span#${type}`)
      .append('svg')
      .attr('width', diameter)
      .attr('height', diameter)
      .attr('class', 'bubble');

    const mouseout = d => {
      console.log(d)
      svg.select('.highlight circle')
        .transition(`RemoveHighlight-${d.data.Name}`)
        .duration(100)
        .attr('r', d.r)
        .on('end', _ => svg.select('g.highlight').remove())
    }

    const mouseover = d => {
      highligth_g = svg
        .append('g')
        .attr('transform', `translate(${d.x}, ${d.y})`)
        .classed('highlight', true)

      highligth_g.append('circle')
        .attr('r', d.r)
        .style('fill', color(d.data.Name))
        .transition(`AddHighlight-${d.data.Name}`)
        .duration(100)
        .attr('r', d.r * 1.5)

      highligth_g.append('text')
        .attr('dy', '.2em')
        .style('text-anchor', 'middle')
        .text(d.data.Name)
        .attr('font-family', 'sans-serif')
        .attr('font-size', d => 10) // Debería ser dinámico
        .attr('fill', 'white');

      highligth_g.append('text')
        .attr('dy', '1.3em')
        .style('text-anchor', 'middle')
        .text(d.data.Count)
        .attr('font-family', 'Gill Sans', 'Gill Sans MT')
        .attr('font-size', d => 10) // Debería ser dinámico
        .attr('fill', 'white');

      highligth_g.on('mouseout', _ => mouseout(d))
    }


    // Creamos los nodos
    node = svg.selectAll('.node')
      .data(bubble(nodes).descendants(), d => d.data.Name)
      .enter()
      .filter(d => !d.children && d.r) // Esto ignora los agrupamientos generales (comentar para ver a que me refiero)
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    // Les damso título (tooltip)
    node.append('title')
      .text(d => `${d.data.Name}: ${d.data.Count}`)


    // Coloreamos los círculos
    node.append('circle')
      .attr('r', d => d.r)
      .style('fill', (d) => {
        return color(d.data.Name)
      })
      .attr('class', d => `node ${parse_name(d.data.Name)}`)  // Parseamos el nombre y lo asignamos como clase
      .on('mouseover', mouseover)

    // Escribimos el texto y el tamaño
    node.append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .text(d => d.data.Name)
      .attr('font-family', 'sans-serif')
      .attr('font-size', d => 10) // Debería ser dinámico
      .attr('fill', 'white');

    node.append('text')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .text(d => d.data.Count)
      .attr('font-family', 'Gill Sans', 'Gill Sans MT')
      .attr('font-size', d => 10) // Debería ser dinámico
      .attr('fill', 'white');
  })
}

const decision_tree = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_decision_tree.csv'
const random_forest = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_random_forest.csv'
create(decision_tree, 300, 'tree')
create(random_forest, 300, 'forest')
