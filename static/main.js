let TOWNS = [
    ['Tielt', '37015'],
    ['Wielsbeke', '37017'],
    ['Waregem', '34040'],
    ['Wingene', '37018'],
    ['Dentergem', '37002'],
    ['Ruiselede', '37012'],
    ['Meulebeke', '37007'],
    ['Pittem', '37011'],
    ['Zulte', '44081'],
    ['Oostrozebeke', '37010'],
    ['Deinze', '44083']
];

function draw_results() {
    let parent_el = $('#dashboard-container');
    let intervals = [];
    for (let i = 0; i < TOWNS.length; i++) {
        let town = TOWNS[i];
        let container_el = $('#container-' + town[1]);
        let template = $.templates('#result-template');
        $.when(fetch_data(town[1])).then(
            function success(api_response) {
                let table = draw_table(town, api_response['data'], container_el, template);
                intervals.push(
                    setInterval(function() {
                        table.ajax.reload(null, false);
                    }, 180000)
                );
            },
            function error(jqXHR, status, error) {
                container_el.append(template.render(
                    {
                        town: town[0],
                        error: error
                    }
                ));
            }
        );
    }
    parent_el.on('click', 'a', function () {
        let parent = $(this).parentsUntil('.border').parent();
        parent.removeClass('border-info border-warning')
            .addClass('border-info');
        let h = parent.find('h5');
        h.find('a').remove();
    });
}

function fetch_data(town_id) {
    return $.ajax({
        method: 'GET',
        url: '/api/results/year/2018/version/2018/' + town_id,
    });
}

function draw_table(town, api_results, container_el, template) {
    let result_id = api_results['_id'];
    container_el.append(template.render({
        town: town[0],
        result_id: result_id
    }));
    return data_table('#table_' + result_id, town[1]);
}

function draw_graph(town, api_results, container_el, template) {
    let graph_id = 'graph_' + api_results['_id'];
    let result_id = api_results['_id'];
    let results = [];
    let seats = [];
    let colours = [];
    let parties = [];
    for (let i = 0; i < api_results['results'].length; i++) {
        let result = api_results['results'][i];
        results.push([result['name'], result['percentage']]);
        seats.push([result['name'], result['seats']]);
        colours.push(result['colour']);
        parties.push({
            name: result['name'],
            colour: result['colour']
        });
    }
    container_el.append(template.render(
        {
            town: town,
            counted: api_results['counted_stations'],
            total: api_results['polling_stations'],
            result_id: result_id,
            parties: parties
        }
    ));
    graph_thumb('#' + graph_id, results, colours, api_results['counted_stations'], api_results['polling_stations'], result_id);
}


$(document).ready(function () {
    draw_results();
});
