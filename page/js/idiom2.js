(function () {
  svg = d3.select('#idiom2-center').append('svg')

  // Definimos márgenes
  const MARGIN = { TOP: 30, BOTTOM: 30, LEFT: 20, RIGHT: 20 };

  // Definimos dimensiones del svg
  const HEIGHT = 600
  const WIDTH = 1000

  const RADIUS = 14

  // Definimos dimensiones del svg considerando margenes
  const widthSVG = WIDTH - MARGIN.RIGHT - MARGIN.LEFT;
  const heighSVG = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;

  let i = 0;

  var orientation = {
    size: [widthSVG, heighSVG],
    x: d => d.x,
    y: d => d.y
  };

  const create_tree = (dataset) => {
    const containerTree = svg
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .append('g')
      .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    tree = d3.tree()
      .size(orientation.size)
    data = tree(d3.hierarchy(dataset))

    const nodes = data.descendants().map(node => {
      if (!node.children) {
        node.is_leaf = true
      }
      node.id = i
      i += 1
      return node
    });
    const links = data.links();

    // Creamos cada link
    tree_links = containerTree
      .selectAll('.link')
      .data(links)
      .enter()

    tree_links.append('path')
      .attr('id', d => `id-${d.source.id}-${d.target.id}`)
      .attr('d', link => {
        if (link.source.x > link.target.x) {
          return `
            M ${link.target.x} ${link.target.y}
            C ${link.target.x} ${(link.source.y + link.target.y) / 2}
              ${link.source.x} ${(link.target.y + link.source.y) / 2} 
              ${link.source.x} ${link.source.y}
          `
        } else {
          return `
            M ${link.source.x} ${link.source.y}
            C ${link.source.x} ${(link.target.y + link.source.y) / 2} 
              ${link.target.x} ${(link.source.y + link.target.y) / 2}
              ${link.target.x} ${link.target.y}
          `
        }
      })
      .style('fill', 'none')
      .style('stroke', 'gray')
      .style('stroke-width', '3px')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1)

    tree_links
      .append('text')
      .style('font-size', 12)
      .attr('dy', -5)
      .attr('dx', -5)
      .append('textPath')
      .attr('xlink:href', link => `#id-${link.source.id}-${link.target.id}`)
      .attr('startOffset', link => {
        if (link.source.x > link.target.x) {
          return `${2 / (link.source.height + 3) * 50}%`
        } else {
          return `${2 / (link.source.depth + 2) * 50}%`
        }
      })
      .text(link => {
        data = link.source.data.name.split(' ')
        if (link.source.x < link.target.x) {
          return `${data[0]} ${data[1]} ${Number(data[2]).toFixed(2)}`
        }
        return `${Number(data[2]).toFixed(2)} ${data[1]} ${data[0]}`
      })

    // Creamos cada nodo
    var node = containerTree
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle');

    node.
      attr('class', d => {
        node_class = `node id-${d.id}`
        return node_class
      })
      .attr('r', 0)
      .attr('cx', orientation.x)
      .attr('cy', orientation.y)
      .style('fill', '#ef5350')
      .on('mouseover', d => {
        console.log(d)
        if (d.is_leaf) {
          d3
          .select(`#idiom2-center .id-${d.id}`)
            .transition()
              .duration(400)  
              .attr('r', RADIUS * 1.5)
        }
      })
      .transition()
      .duration(600)
      .attr('r', RADIUS);
  }


  const main = async () => {
    dataset = await d3.json('https://raw.githubusercontent.com/fjlopez7/proyecto_info_vis/master/data/trees/decision_tree_4.json')
    create_tree(dataset)
  }

  main()
})()

