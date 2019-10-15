(function () {

  // Convierte el nombre en un string apto apra ser una clase
  const parse_name = (name) => {
    return name.split(' ').join('-')
  }

  // Convierte el datast en algo apto para ser pasado por hierarchy
  const parse_dataset_bubble = (data, type) => {
    return { children: data.slice(0, data.length).map(d => { return { Name: d.genre, Count: d.numberclassified, Type: type } }) }
  }

  const parse_dataset_bar = (data, type) => {
    return {
      Type: type,
      "Precision": data.precision,
      "Recall": data.recall,
      'F1-Score': data['f1-score']
    }
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

  let to_hide = []

  // Creamos la escala de color
  const color_bubble = d3.scaleOrdinal(d3.schemeCategory10);

  // Creamos svg izquierdo y derecho
  const svg_left = d3.select('#idiom1-left').append('svg').attr('id', 'left')
  const svg_right = d3.select('#idiom1-right').append('svg').attr('id', 'right')

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
    clicked_node = null;

    const click = d => {
      bar_svg = 'left' == svg.attr('id') ? svg_right : svg_left
      if (!clicked) {
        clicked = true
        clicked_node = d;
        index_1 = data.findIndex(other => other.genre == d.data.Name)
        index_2 = data.findIndex(data => data.genre == d.data.Name)
        destroy_buble(bar_svg)
        create_bar(bar_svg, diameter, data[index_1], 'DecisionTree', other[index_2], 'RandomForest')
      }
      else if (clicked_node.data.Name == d.data.Name){
        new_type = 'forest' == type ? 'tree' : 'forest'
        clicked = false
        destroy_bar(bar_svg)
        create_bubble(other, diameter, bar_svg, new_type, data)

        bar_svg.select(`.${parse_name(d.data.Name)}`)
          .style('stroke', 'red')
        bar_svg.selectAll(to_hide)
          .attr('opacity', '0.3')
      }
    }

    // Definimos las funciones mouseout y mouseover
    const mouseout = d => {
      if (clicked) return
      // Deshacemos highlight
      svg_left.select(`.${parse_name(d.data.Name)}`)
        .style('stroke', '')
      svg_right.select(`.${parse_name(d.data.Name)}`)
        .style('stroke', '')

      console.log(to_hide)
      svg_left.selectAll(to_hide)
        .transition()
        .duration(200)
        .style('opacity', '1')
      svg_right.selectAll(to_hide)
        .transition()
        .duration(200)
        .style('opacity', '1')

      to_hide = []
    }

    const mouseover = d => {
      if (clicked) return

      // Hacemos Highlight
      svg_left.select(`.${parse_name(d.data.Name)}`)
        .style('stroke', 'red')
      svg_right.select(`.${parse_name(d.data.Name)}`)
        .style('stroke', 'red')

      // Hacemos hide del resto
      to_hide = '.' + data
        .filter(item => item.genre != d.data.Name)
        .map(item => parse_name(item.genre))
        .join(',.')
      svg_left.selectAll(to_hide)
        .transition()
        .duration(200)
        .style('opacity', 0.3)
      svg_right.selectAll(to_hide)
        .transition()
        .duration(200)
        .style('opacity', 0.3)
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

    // Coloreamos los círculos
    node.append('circle')
      .attr('class', d => parse_name(d.data.Name))
      .transition()
      .delay(100)
      .attr('r', d => d.r)
      .style('fill', (d) => {
        return color_bubble(d.data.Name)
      })

    // Escribimos el texto y el tamaño
    node.append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .text(d => d.data.Name)
      .attr('font-family', 'sans-serif')
      .attr('font-size', d => {
        font_size = d.r / 5
        return font_size > 10 ? font_size : 10
      }) // Debería ser dinámico
      .attr('fill', 'white')


    node.append('text')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .text(d => d.data.Count)
      .attr('font-family', 'Gill Sans', 'Gill Sans MT')
      .attr('font-size', d => {
        font_size = d.r / 5
        return font_size > 10 ? font_size : 10
      }) // Debería ser dinámico
      .attr('fill', 'white')

    // Agregamos circulos transparentes
    node.append('circle')
      .style('opacity', '0')
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('click', click)
      .attr('class', 'cover node')
      .attr('r', d => d.r)

  }

  const destroy_buble = (svg) => {
    svg.selectAll('.node')
      .transition().call(exit_transition)
      .remove()
  }


  const create_bar = (svg, diameter, data_1, type_1, data_2, type_2) => {
    height = diameter
    width = diameter
    margin = { top: 10, right: 10, bottom: 20, left: 40 }

    data = [parse_dataset_bar(data_1, type_1), parse_dataset_bar(data_2, type_2)]

    groupKey = 'Type'
    keys = ['Precision', 'Recall', 'F1-Score']

    color = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888"])

    x0 = d3.scaleBand()
      .domain(['DecisionTree', 'RandomForest'])
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1)

    x1 = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05)

    y = d3.scaleLinear()
      .domain([0, 1]).nice()
      .rangeRound([height - margin.bottom, margin.top])

    xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))

    yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))

    legend = svg => {
      const g = svg
        .attr("transform", `translate(${width},0)`)
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(color.domain().slice().reverse())
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

      g.append("rect")
        .transition()
        .duration(400)
        .attr("x", -19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

      g.append("text")
        .transition()
        .duration(400)
        .attr("x", -24)
        .attr("y", 9.5)
        .attr("dy", "0.35em")
        .text(d => d);
    }

    svg.attr('width', width).attr('height', height)
    svg = svg.append('g').attr('id', 'barchart')

    svg.append("g")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", d => `translate(${x0(d[groupKey]) - 1}, 0)`)
      .selectAll("rect")
      .data(d => keys.map(key => ({ key, value: d[key] })))
      .join("rect")
      .transition()
      .duration(400)
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => color(d.key));

    svg.append("g")
      .transition()
      .duration(400)
      .call(xAxis);

    svg.append("g")
      .call(yAxis);

    svg.append("g")
      .call(legend);
  }

  const destroy_bar = (svg) => {
    svg.selectAll('#barchart')
      .transition()
      .duration(200)
      .style('opacity', '0')
      .remove()
  }

  const main = async () => {
    const decision_tree = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/data/stats/stats_decision_tree.csv'
    const random_forest = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/data/stats/stats_random_forest.csv'
    const real = 'https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/data/stats/stats_test.csv'

    tree_data = await d3.csv(decision_tree)
    forest_data = await d3.csv(random_forest)
    real_data = await d3.csv(real)

    create_bubble(tree_data, 450, svg_left, 'tree', forest_data)
    create_bubble(forest_data, 450, svg_right, 'forest', tree_data)
  }

  main()
})()