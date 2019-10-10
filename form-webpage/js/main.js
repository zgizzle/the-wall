(function($) {
  "use strict";

  /*==================================================================
    [ Validate after type ]*/
  $(".validate-input .input100").each(function() {
    $(this).on("blur", function() {
      if (validate(this) == false) {
        showValidate(this);
      } else {
        $(this)
          .parent()
          .addClass("true-validate");
      }
    });
  });

  /*==================================================================
    [ Validate ]*/
  var input = $(".validate-input .input100");

  $(".validate-form").on("submit", function() {
    var check = true;

    for (var i = 0; i < input.length; i++) {
      if (validate(input[i]) == false) {
        showValidate(input[i]);
        check = false;
      }
    }

    return check;
  });

  $(".validate-form .input100").each(function() {
    $(this).focus(function() {
      hideValidate(this);
      $(this)
        .parent()
        .removeClass("true-validate");
    });
  });

  function validate(input) {
    if ($(input).attr("type") == "email" || $(input).attr("name") == "email") {
      if (
        $(input)
          .val()
          .trim()
          .match(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
          ) == null
      ) {
        return false;
      }
    } else {
      if (
        $(input)
          .val()
          .trim() == ""
      ) {
        return false;
      }
    }
  }

  function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass("alert-validate");

    $(thisAlert).append('<span class="btn-hide-validate">&#xf136;</span>');
    $(".btn-hide-validate").each(function() {
      $(this).on("click", function() {
        hideValidate(this);
      });
    });
  }

  function hideValidate(input) {
    var thisAlert = $(input).parent();
    $(thisAlert).removeClass("alert-validate");
    $(thisAlert)
      .find(".btn-hide-validate")
      .remove();
  }

  /*==================================================================
    [ Show / hide contact ]*/
  $(".btn-hide-contact100").on("click", function() {
    $(".container-contact100").fadeOut(300);
  });

  $(".btn-show-contact100").on("click", function() {
    $(".container-contact100").fadeIn(300);
  });
})(jQuery);

function hexToRgbA(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + ",0.3)"
    );
  }
  throw new Error("Bad Hex");
}

document.getElementById("noteColour").onchange = function() {
  BaseColour = document.getElementById("noteColour").value;
  BColour = hexToRgbA(BaseColour);
  document.getElementsByClassName(
    "container-contact100"
  )[0].style.background = BColour;
  /* document.getElementsByClassName("input100")[0].style.background = BColour; */
};
