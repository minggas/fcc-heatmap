const container = document.querySelector(".container");
console.dir(container);

let w = container.clientWidth - 100,
  h = container.clientHeight - 110;

//Mouse over element
const overlay = d3
  .select(".container")
  .append("div")
  .attr("class", "overlay")
  .style("opacity", 0);
//Tooltip with data information
const tooltip = d3
  .select(".container")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);
//Chart container
const svgContainer = d3
  .select(".container")
  .append("svg")
  .attr("class", "chart")
  .attr("width", "100%")
  .attr("height", "100%");

//Fetch the data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then(data => {
    const yLabel = data.name.split(",")[0];
    const dates = data.data.map(date => date[0]);
    const values = data.data.map(val => val[1]);
    const dataLength = data.data.length;
    const minDate = new Date(d3.min(dates));
    const maxDate = new Date(d3.max(dates));
    const minValue = d3.min(values);
    const maxValue = d3.max(values);
    const barWidth = w / dataLength;

    //Y Axis Label
    const yText = svgContainer
      .append("text")
      .attr("class", "y-label")
      .attr("transform", "rotate(-90)")
      .attr("x", function(d, j) {
        return h / 5 - h;
      })
      .attr("y", 80)
      .text(yLabel);
    //X Label informations
    const xText = svgContainer
      .append("text")
      .attr("class", "x-label")
      .attr("x", w)
      .attr("y", h + 60)
      .text(data.description.split("\n")[2].split("-")[0]);
    svgContainer
      .append("a")
      .attr(
        "href",
        data.description
          .split("\n")[2]
          .split("-")[1]
          .replace("(", "")
          .replace(")", "")
      )
      .attr("target", "_blank")
      .attr("class", "link")
      .append("text")
      .attr("class", "x-label")
      .attr("x", w)
      .attr("y", h + 80)
      .text(data.description.split("\n")[2].split("-")[1]);
    //Scale the chart with the time data
    const xScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([0, w]);

    const xAxis = d3.axisBottom().scale(xScale);
    //Put the X axis on the chart
    const xAxisGroup = svgContainer
      .append("g")
      .call(xAxis)
      .attr("id", "x-axis")
      .attr("transform", `translate(60,${h})`);
    //Scale the chart with the values data
    const yScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([(minValue / maxValue) * h, h]);

    const scaledValues = values.map(function(item) {
      return yScale(item);
    });
    //Create the Y axis scale
    const yAxisScale = d3
      .scaleLinear()
      .domain([minValue, maxValue])
      .range([h, (minValue / maxValue) * h]);

    const yAxis = d3.axisLeft(yAxisScale);
    //Put the Y axis on the chart
    const yAxisGroup = svgContainer
      .append("g")
      .call(yAxis)
      .attr("id", "y-axis")
      .attr("transform", "translate(60, 0)");
    //Put the chart on the DOM
    d3.select("svg")
      .selectAll("rect")
      .data(scaledValues)
      .enter()
      .append("rect")
      .attr("data-date", (d, i) => dates[i])
      .attr("data-gdp", (d, i) => values[i])
      .attr("class", "bar")
      .attr("x", (d, i) => i * barWidth)
      .attr("y", d => h - d)
      .attr("width", barWidth)
      .attr("height", d => d)
      .style("fill", "hsla(105, 30%, 50%, 0.5)")
      .attr("transform", "translate(60, 0)")
      //Make the tooltip appear and highligth the bar with the mouse over
      .on("mouseover", (d, i) => {
        overlay
          .transition()
          .duration(0)
          .style("background-color", "hsla(105, 30%, 50%, 0.9)")
          .style("height", `${d}px`)
          .style("width", `${barWidth}px`)
          .style("opacity", 0.9)
          .style("left", `${i * barWidth + 15}px`)
          .style("top", `${h - d + 13}px`)
          .style("transform", "translateX(60px)");
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip
          .html(
            new Date(dates[i]).toLocaleDateString("en", {
              year: "numeric",
              month: "long"
            }) +
              "<br>" +
              "$" +
              values[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") +
              " Billion"
          )
          .attr("data-date", dates[i])
          .style("left", `${i * barWidth - 40}px`)
          .style("top", `${h - d - 55}px`)
          .style("transform", "translateX(60px)");
      })
      .on("mouseout", function(d) {
        overlay
          .transition()
          .duration(200)
          .style("opacity", 0);
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      });
  })
  .catch(err => {
    alert(err);
  });
