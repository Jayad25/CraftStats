window.bubblechart = (function (category,selectyear) {

    document.getElementById("bubblechart").innerHTML = "";
    
    let width = 1000,
        height = 900;
    padding = 1.5, // separation between same-color nodes
        clusterPadding = 6;
    var svgContainer = d3
        .select("#bubblechart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var keyword = d3.set("", function (movie) {
        if (movie.genres.length > 0) {
            // console.log(Math.floor(movie.vote_average));
            return Math.floor(movie.vote_average);
        }
    });

    var color = d3.scaleOrdinal(d3.schemeCategory20)
        .domain(keyword);

    let forceX = d3
      .forceX(function(d) {
            let vote=Math.floor(d.vote_average)
            if (vote === 5) return 150;
          if (vote === 6) return 500;
            else if (vote === 7) return 600;
            else return 500;
          
        // return width/8
        })
      .strength(0.05);

    let forceY = d3
        .forceY(function (d) {
            let vote = Math.floor(d.vote_average)
            if (d.genres.length > 0) {
                if (vote === 8) return 250;
                else if (vote === 4)  return 900;
            else return 700;
            }
            // return height/8
        })
        .strength(0.05);

    let forceCollide = d3.forceCollide(function (d) {
        return radiusScale(d.popularity * 2)+1;
    }
    )
    var simulation = d3.forceSimulation()
        .force("x", forceX)
        .force("y", forceY)
        .force("collide", forceCollide);

    var radiusScale = d3.scaleSqrt().domain([-10, 800]).range([10, 80])

    d3.queue()
        .defer(d3.json, "data/movie.json")
        .await(ready)


    function ready(error, olddatapoints) {
        let datapoints = []
        datapoint = function(x){
           
           x.forEach(d =>{
               let date = d.release_date.slice(0, 4);
               if (d.genres.length > 0) {
                   if (d.genres[0].name == category && date == selectyear) {
                       datapoints.push(d)
           }}
        })
    }
        datapoint(olddatapoints)
       
        var circles = svgContainer
          .selectAll("circle")
          .data(datapoints)
          .enter()
          .append("circle")
          .on("mouseover", function(d) {
            updatedetails(d)
          });
        function updatedetails(d) {
            var info = "";
            if (d) {
                info = "Title:"+d.original_title+"\n vote_average:"+d.vote_average
                
            }
            document.getElementById("details").innerHTML=info;
        }
    
        var cate = 0
        circles.attr("r", function (d) {
            let date = d.release_date.slice(0, 4);
            if (d.genres.length > 0) {
                
                if (d.genres[0].name == category && date == selectyear  ) {
              cate++;
                    // console.log(d.popularity)
              return radiusScale(d.popularity * 2);
            }
        }
        })
        
            .style("fill", function (d) {
                if (d.genres.length > 0) {
                    return color(Math.floor(d.vote_average));
                }
            })
            .sort(function (a, b) {
            return (a.value - b.value);
        })
        d3.select("#Combine").on("click",function(d){
                simulation.force("x",d3.forceX(width/2).strength(0.05))
                .alphaTarget(0.5)
                .restart()
                simulation.force("y", d3.forceY(height / 2).strength(0.05))
                .alphaTarget(0.5)
                .restart()
        
            }
            )
        d3.select("#split").on("click", function (d) {
           
            simulation.force("x", forceX)
                .alphaTarget(0.5)
                .restart()
            simulation.force("y", forceY)
                .alphaTarget(0.5)
                .restart()

        }
        )
        simulation.nodes(datapoints).on('tick', ticked)
       
        function ticked() {
            circles.attr("cx", function (d) {
                if(d.x) return d.x
                else
                return 0
            })
            circles.attr("cy", function (d) {

                if(d.y) return d.y
                else return 0
            })
        }
        var legend = svgContainer.selectAll(".legend")
            .data(datapoints).enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + 780 + "," + 120 + ")");
        legend.append("text")
            .attr("x", 25)
            .classed("bubblelabel", true)
            .attr("dy", "1em")
            .attr("y", function (d, i) { return 20 * i; })
            .text(function (d) {
                value = document.getElementsByClassName("bubblelabel")
                let isthere = false
                let newValue = Math.floor(d.vote_average);
                for (let i = 0; i < value.length; i++) {

                    var one = parseInt(value[i].innerHTML)
                    var two = newValue
                    if (one === two) {
                        // console.log("isthere");
                        isthere = true
                    }
                }

                if (!isthere) {

                    // console.log('one')
                    return Math.floor(d.vote_average);
                }
            })
            .attr("font-size", "12px");


        legend
          .append("rect")
          .attr("x", 0)
          .attr("y", function(d, i) {
            return 20 * i;
          })
          .attr("width", 15)
          .attr("height", 15)
          .classed("bubblerect", true)
          .style("fill", function(d) {
             
                  return color(Math.floor(d.vote_average));
              }
          );


        

        legend.append("text")
            .attr("x", 31)
            .attr("dy", "-.2em")
            .attr("y", -10)
            .text("Voting average")
            .attr("font-size", "17px"); 
        
    
    }


})
