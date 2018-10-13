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
    let container_el = $('#result-container');
    for (let i = 0; i < TOWNS.length; i++) {
        let town = TOWNS[i];
        let template = $.templates('#result-template');
        $.when(fetch_data(town[1])).then(
            function success(api_response) {
                draw_graph(town[0], api_response['data'], container_el, template);
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
}

function fetch_data(town_id) {
    return $.ajax({
        method: 'GET',
        url: '/api/results/year/2012/version/2012/' + town_id,
    });
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
