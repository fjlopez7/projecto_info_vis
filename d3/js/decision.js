// Convierte el nombre en un string apto apra ser una clase
const parse_name = (name) => {
  return name.split(" ").join("-")
}

// Convierte el datast en algo apto para ser pasado por hierarchy
const parse_dataset_bubble = (data, type) => {
  return { children: data.slice(0, data.length).map(d => { return { Name: d.genre, Count: d.numberclassified, Type: type } }) }
}

// Crea el pack creator dado un diametro
const create_bubble_pack = diameter => {
  return d3.pack()
    .size([diameter, diameter])
    .padding(1.5);
}

// Crea los nodos
const create_bubble_nodes = dataset => {
  return d3.hierarchy(dataset).sum(d => d.Count)
}

// Creamos svg izquierdo y derecho
const svg_left = d3.select('#left').append('svg')
const svg_right = d3.select('#right').append('svg')

// Creamos la escala de color
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Función que crea el gráfico. Recibe la url del json, el tamaño y el tipo.
const create_bubble = (data, diameter, svg, type) => {
  // Adaptamos el dataset
  const dataset = parse_dataset_bubble(data, type)

  // Creamos el pack
  const bubble = create_bubble_pack(diameter)

  // Creamos los nodos usando hierarchy
  nodes = create_bubble_nodes(dataset)

  // Modificamos el svg recibido
  svg.attr('width', diameter)
    .attr('height', diameter)
    .attr('id', `${name}-bubble`)
    .attr('class', `bubble`);
  
  // Definimos las funciones mouseout y mouseover
  const mouseout = d => {
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
    .data(bubble(nodes).descendants(), d => d.data.Type)

  // Animamos su salida
  node.exit()
    .transition()
      .duration(100)
      .selectAll('circle')
        .attr('r', '0')
    .remove()

  // Creamos los componentes gráficos
  node = node.enter()
    .filter(d => !d.children && d.r) // Esto ignora los agrupamientos generales (comentar para ver a que me refiero)
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`)

  // Les damso título (tooltip)
  node.append('title')
    .text(d => `${d.data.Name}: ${d.data.Count}`)


  // Coloreamos los círculos
  node.append('circle')
    .on('mouseover', mouseover)
    .transition()
    .delay(100)
    .attr('r', d => d.r)
    .style('fill', (d) => {
      return color(d.data.Name)
    })

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
}


const create_bar = (data, type) => {

}


const main = async () => {
  const decision_tree = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_decision_tree.csv'
  const random_forest = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_random_forest.csv'
  const real = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_test.csv'

  tree_data = await d3.csv(decision_tree)
  forest_data = await d3.csv(random_forest)
  real_data = await d3.csv(real)

  create_bubble(tree_data, 300, svg_left, 'tree')
  create_bubble(forest_data, 300, svg_right, 'forest')
}

main()