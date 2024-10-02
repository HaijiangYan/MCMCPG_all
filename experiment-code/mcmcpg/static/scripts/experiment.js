var my_node_id;

// Create the agent.
create_agent = function() {
  dallinger.createAgent()
    .done(function (resp) {
      // console.log(resp);
      my_node_id = resp.node.id;

      if (resp.node.details['no'] !== 0 && resp.node.details['no']%402 === 0) {
        alert("Hint: question changed!")
      } else if (resp.node.details['no'] !== 0 && resp.node.details['no']%201 === 0) {
        alert("Dear participant, it's time to have a short break! You can continue on when you feel good.")
      }

      switch (resp.node.details['emo']) {
        case "happy":
          $("h1").html("Who looks <b>happier?</b>");
          get_infos();
          break;
        case "sad":
          $("h1").html("Who looks <b>sadder?</b>");
          get_infos();
          break;
        case "neu":
          $("h1").html("Who looks <b>more neutral?</b>");
          get_infos();
          break;
        case "catcher":
          catcher();
          break;
        default:
          deleteNode(my_node_id);
          dallinger.goToPage('instruct-2');
      }
    })
    .fail(function (rejection) {
      // A 403 is our signal that it's time to go to the questionnaire
      if (rejection.status === 403) {
        dallinger.allowExit();
        dallinger.goToPage('questionnaire');
      } else {
        dallinger.error(rejection);
      }
    });
};

get_infos = function() {
  dallinger.getInfos(my_node_id)
    .done(function (resp) {
      // console.log(resp)
      sides_switched = Math.random() < 0.5;

      face_current = JSON.parse(resp.infos[0].contents);
      face_proposal = JSON.parse(resp.infos[1].contents);

      if (sides_switched === false) {
        showFace(face_current, "left");
        showFace(face_proposal, "right");
      } else {
        showFace(face_proposal, "left");
        showFace(face_current, "right");
      }
      $(".submit-response").attr('disabled', false);
    });
};

catcher = function () {
  dallinger.getInfos(my_node_id)
    .done(function (resp) {
      sides_switched = false
      // console.log(resp)
      catcher_left = JSON.parse(resp.infos[0].contents);
      catcher_right = JSON.parse(resp.infos[1].contents);

      $("#face_left").attr('src', catcher_left["face"]);
      $("#face_right").attr('src', catcher_right["face"]);

      $(".submit-response").attr('disabled', false);
    });
}

submit_response = function(choice) {
  if (sides_switched === true) {
    choice = 1 - choice;
  }
  $(".submit-response").attr('disabled',true);
  shield();

  dallinger.post('/choice/' + my_node_id + '/' + choice)
    .then(function () {
      create_agent();
    });
};

function showFace (face, side) {
  if (side === "left") {
    $("#face_left").attr('src', 'data:image/jpeg;base64,' + face["face"]);
  } else if (side === "right") {
    $("#face_right").attr('src', 'data:image/jpeg;base64,' + face["face"]);
  }
}

function shield() {
  $("#face_left, #face_right").attr('src', 'static/images/shield.jpg');
}


function deleteNode (my_node_id) {
  dallinger.post('/delete/' + my_node_id);
}