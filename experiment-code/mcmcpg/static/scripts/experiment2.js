var my_node_id;

// Create the agent.
create_agent = function() {
  $('#after_chosen').hide();
  dallinger.createAgent()
    .done(function (resp) {
      my_node_id = resp.node.id;
      get_infos();
    })
    .fail(function (rejection) {
      // A 403 is our signal that it's time to go to the questionnaire
      if (rejection.status === 403) {
        dallinger.allowExit();
        dallinger.goToPage('question');
      } else {
        dallinger.error(rejection);
      }
    });
};

get_infos = function() {
  dallinger.getInfos(my_node_id)
    .done(function (resp) {
      face = JSON.parse(resp.infos[0].contents);
      // console.log(resp.infos[0]);
      if (resp.infos[0].details[0] === "r") {
        showFace(face, "96", "60");
      }
      else {
        showFace(face, "72", "72");
      }

    //   var selectedOption = $('input[name="decision"]:checked').val();
    //   if (!isOptionSelected) {
    //   $("button").attr('disabled', true);
    // } else {$("button").attr('disabled', false);}
    // only when at least one option is chosen is the button able to be click

    });
};

submit_response = function() {

  $("button").attr('disabled',true);
  var choice = $('input[name="decision"]:checked')[0];
  var rating = $('#ratingSlider');
  dallinger.post('/probe/' + my_node_id + '/' + choice.value + '/' + rating.val())
    .then(function () {
      choice.checked = false;
      rating.val(0);
      $('#ratingValue').text(0);
      create_agent();
    });
};

showFace = function (face, height, width) {
  $("#face_probe").attr('height', height).attr('width', width).attr('src', face["image"]);
}

function deleteNode (my_node_id) {
  dallinger.post('/delete/' + my_node_id)
}
