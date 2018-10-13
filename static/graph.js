function graph_thumb(selector, results, colors, counted, total, result_id) {
    let svg = $(selector);
    if (counted !== 0) {
        svg.removeAttr('display');
        svg.parent().find('.alert').remove();
        add_graph(selector, results, colors);
    } else {
        svg.attr('display', 'none');
        svg.parent().find('.alert').remove();
        svg.parent().append('<div class="alert alert-light">Nog geen resultaten.</div>');
    }
}

function graph_main(selector, seats, results, colors, graph_type, id, counted, total) {

    let src_data = seats;
    if (graph_type !== 'seats') {
        src_data = results;
    }
    let svg = $(selector);
    if (counted !== 0) {
        svg.removeAttr('display');
        svg.parent().find('.alert').remove();
        add_graph(selector, src_data, colors);
    } else {
        svg.attr('display', 'none');
        svg.parent().find('.alert').remove();
        svg.parent().append('<div class="alert alert-light">Nog geen resultaten.</div>');
    }

    let legend_el = $('#caption_' + id);
    let switch_graph_el = $('#switch_graph_' + id);
    add_legend(legend_el, switch_graph_el, graph_type, src_data, colors, counted, total);
    switch_graph_el.find('button').removeClass('active');
    switch_graph_el
        .find('[data-hx-graph-type="' + graph_type + '"]')
        .removeClass('active')
        .addClass('active');
    switch_graph_el
        .on('click', 'button', function () {
            let a = $(this);
            let new_graph_type = a.attr('data-hx-graph-type');
            if (new_graph_type !== graph_type) {
                graph_main(selector, seats, results, colors, new_graph_type, id, counted, total);
            }
        });
}

function data_table(selector, table_data) {
    let table_el = $(selector);
    table_el.DataTable({
        data: table_data,
        columnDefs: [
            {
                render: function (data, type, row) {
                    return data + '%';
                },
                targets: 1
            }
        ],
        order: [
            [1, 'desc'],
            [2, 'desc'],
            [0, 'asc']
        ],
        paging: false,
        info: false,
        language: {
            decimal: ',',
            thousands: '.',
            search: 'Zoeken:',
            zeroRecords: 'Niets gevonden'
        }
    });
}

function add_legend(parent_el, switch_graph_el, graph_type, src_data, colors, counted, total) {

    let legend_text = '<ul class="list-inline">';

    for (let i = 0; i < src_data.length; i++) {
        // name, result
        let party = src_data[i];
        if (party[1] === 0) {
            // skip
            continue;
        }
        let party_text = '<li class="list-inline-item">' + party[0] /* + ': ' + party[1]*/;
        if (colors[i] !== undefined) {
            party_text = party_text + ' <span class="oi oi-media-stop" style="color: ' + colors[i] + '" title="Kleur ' + party[0] + '" aria-hidden="true"></span>';
        }
        party_text = party_text + '</li>';
        legend_text = legend_text + party_text;
    }

    legend_text = legend_text + '</ul>';

    let stations_counted;

    if (total === 1) {
        stations_counted = '(' + counted + ' van ' + total + ' stembureau geteld)';
    } else {
        stations_counted = '(' + counted + ' van ' + total + ' stembureaus geteld)';
    }

    if (graph_type === 'seats') {
        legend_text = '<h6 class="el-results">Zetelverdeling <small class="text-muted small"><i>' + stations_counted + '</i></small></h6>' + legend_text;
    } else {
        legend_text = '<h6 class="el-results">Resultaten <small class="text-muted small"><i>' + stations_counted + '</i></small></h6>' + legend_text;
    }

    parent_el.empty();
    parent_el.append(legend_text);
}

function add_graph(selector, src_data, colors) {
    let svg = d3.select(selector),
        width = +svg.attr('width'),
        height = +svg.attr('height'),
        radius = width / 2,
        g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height + ')');

    let color = d3.scaleOrdinal(colors);

    let pie = d3.pie()
        .sort(null)
        .startAngle(0.5 * Math.PI * -1)
        .endAngle(0.5 * Math.PI)
        .value(function (d) {
            return d[1];
        });

    let path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    let label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    let arc = g.selectAll('.arc')
        .data(pie(src_data))
        .enter().append('g')
        .attr('class', 'arc');

    arc.append('path')
        .attr('d', path)
        .attr('fill', function (d) {
            return color(d.data[0]);
        });

    /*arc.append('text')
        .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
        .attr('dy', '0.35em')
        .text(function(d) { return d.data[0]; });*/
}