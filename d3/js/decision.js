// Convierte el nombre en un string apto apra ser una clase
const parse_name = (name) => {
  return name.split(' ').join('-')
}

// Convierte el datast en algo apto para ser pasado por hierarchy
const parse_dataset_bubble = (data, type) => {
  return { children: data.slice(0, data.length).map(d => { return { Name: d.genre, Count: d.numberclassified, Type: type } }) }
}

const parse_dataset_bar = (data, type) => {
  return [
    { Metric: "Precision", Score: data.precision, Type: type },
    { Metric: "Recall", Score: data.recall, Type: type },
    { Metric: 'F1-Score', Score: data['f1-score'], Type: type }
  ]
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

// Transición de salida
const exit_transition = transition => {
  transition.duration(100)
    .selectAll('circle')
    .attr('r', '0')
    .remove()
}

// Creamos svg izquierdo y derecho
const svg_left = d3.select('#left').append('svg').attr('id', 'left')
const svg_right = d3.select('#right').append('svg').attr('id', 'right')

// Creamos la escala de color
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Función que crea el gráfico. Recibe la url del json, el tamaño y el tipo.
const create_bubble = (data, diameter, svg, type, other) => {
  // Adaptamos el dataset
  const dataset = parse_dataset_bubble(data, type)

  // Creamos el pack
  const bubble = create_bubble_pack(diameter)

  // Creamos los nodos usando hierarchy
  nodes = create_bubble_nodes(dataset)

  // Modificamos el svg recibido
  svg.attr('width', diameter)
    .attr('height', diameter)
    .attr('class', `bubble`);

  // Nos indica si ha sido clickeado o no
  clicked = false;

  const click = d => {
    bar_svg = 'left' == svg.attr('id') ? svg_right : svg_left
    if (!clicked) {
      clicked = true
      index = data.findIndex(other => other.genre == d.data.Name)
      create_bar(data[index], diameter, bar_svg, 'bar')
    }
    else {
      new_type = 'forest' == type ? 'tree' : 'forest'
      clicked = false
      destroy_bar(bar_svg)
      create_bubble(other, diameter, bar_svg, new_type, data)
      mouseout(d)
    }
  }

  // Definimos las funciones mouseout y mouseover
  const mouseout = d => {
    if (clicked) return
    svg.select('.highlight circle')
      .transition(`RemoveHighlight-${d.data.Name}`)
      .duration(100)
      .attr('r', d.r)
      .on('end', _ => svg.select('.highlight').remove())
  }

  const mouseover = d => {
    if (clicked) return
    // Creamos nuevo componente gráico encima
    highligth_g = svg
      .append('g')
      .attr('transform', `translate(${d.x}, ${d.y})`)
      .attr('class', 'highlight')

    // Agregamos circulo visible
    highligth_g.append('circle')
      .attr('r', d.r)
      .attr('class', 'node')
      .style('fill', color(d.data.Name))
      .transition(`AddHighlight-${d.data.Name}`)
      .duration(100)
      .attr('r', d.r * 1.5)

    highligth_g.append('text')
      .attr('class', 'node')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .text(d.data.Name)
      .attr('font-family', 'sans-serif')
      .attr('font-size', d => 10) // Debería ser dinámico
      .attr('fill', 'white');

    highligth_g.append('text')
      .attr('class', 'node')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .text(d.data.Count)
      .attr('font-family', 'Gill Sans', 'Gill Sans MT')
      .attr('font-size', d => 10) // Debería ser dinámico
      .attr('fill', 'white');

    // Agregamos circulo invisible
    highligth_g.append('circle')
      .attr('class', 'node')
      .style('opacity', 0)
      .attr('r', d.r * 1.5)
      .on('mouseout', _ => mouseout(d))
      .on('click', _ => click(d))

  }

  // Creamos los nodos
  node = svg.selectAll('.node')
    .data(bubble(nodes).descendants(), d => d.data.Type)

  // Animamos su salida
  node.exit()
    .transition()
    .call(exit_transition)

  // Creamos los componentes gráficos
  node = node.enter()
    .filter(d => !d.children && d.r) // Esto ignora los agrupamientos generales (comentar para ver a que me refiero)
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`)

  // Les damos título (tooltip)
  node.append('title')
    .text(d => `${d.data.Name}: ${d.data.Count}`)

  // Coloreamos los círculos
  node.append('circle')
    .transition()
    .delay(100)
    .attr('r', d => d.r)
    .style('fill', (d) => {
      return color(d.data.Name)
    })

  // Agregamos circulos transparentes
  node.append('circle')
    .attr('fill', 'white')
    .style('opacity', '0')
    .on('mouseover', mouseover)
    .transition()
    .attr('class', 'cover node')
    .attr('r', d => d.r)

  // Escribimos el texto y el tamaño
  node.append('text')
    .attr('dy', '.2em')
    .style('text-anchor', 'middle')
    .text(d => d.data.Name)
    .attr('font-family', 'sans-serif')
    .attr('font-size', d => 10) // Debería ser dinámico
    .attr('fill', 'white')


  node.append('text')
    .attr('dy', '1.3em')
    .style('text-anchor', 'middle')
    .text(d => d.data.Count)
    .attr('font-family', 'Gill Sans', 'Gill Sans MT')
    .attr('font-size', d => 10) // Debería ser dinámico
    .attr('fill', 'white')

}

const create_bar = (data, diameter, svg, type) => {
  // Parseamos la data
  data = parse_dataset_bar(data, type)

  // Eliminamos nodos del barchart
  svg.selectAll('.node')
    .transition()
    .call(exit_transition)
    .remove()

  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = diameter - margin.left - margin.right,
    height = diameter - margin.top - margin.bottom;

  // Cambiamos el svg
  barContainer = svg.attr('width', diameter)
    .attr('height', diameter)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // Creamos la escala del axis x
  x_axis = d3.scaleBand()
    .range([0, width])
    .domain(data.map(d => d.Metric))
    .padding(0.2);

  // Creamos el contenedor gráfico
  x_container = barContainer.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x_axis))
    .attr('class', 'x-axis')
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Creamos la escala del axis y
  y_axis = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  // Creamos el contenedor gráfico
  y_container = barContainer.append('g')
    .call(d3.axisLeft(y_axis))
    .attr('class', 'y-axis')

  // Bars
  barContainer.selectAll("myBar")
    .data(data, d => d.Type)
    .enter()
    .append("rect")
    .attr("x", d => x_axis(d.Metric))
    .attr("y", d => y_axis(d.Score))
    .attr("width", x_axis.bandwidth())
    .attr("height", d => height - y_axis(d.Score))
    .attr("fill", "#69b3a2")
}

const destroy_bar = (svg) => {
  svg.selectAll('g')
    .transition()
      .duration(200)
      .style('opacity', '0')
}

const main = async () => {
  const decision_tree = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_decision_tree.csv'
  const random_forest = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_random_forest.csv'
  const real = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/stats_test.csv'

  tree_data = await d3.csv(decision_tree)
  forest_data = await d3.csv(random_forest)
  real_data = await d3.csv(real)

  create_bubble(tree_data, 300, svg_left, 'tree', forest_data)
  create_bubble(forest_data, 300, svg_right, 'forest', tree_data)
}

main()