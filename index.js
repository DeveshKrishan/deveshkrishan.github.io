// Audio 
$("#my_audio").get(0).play();

$('#my_audio').prop("volume", 0.15);

// Default case
$("#aboutMe").addClass( "hover" );
var textToReplace = $("#description").text();
var newText = textToReplace.replace(textToReplace, "Take your party directly to About Me to learn more about ONI Base.");
$("#description").text(newText);


// Controls hover interaction with sound, description of item, and such.
$("li").hover(
    function() {
        $("li").removeClass( "hover" );
        $( this ).addClass( "hover" );
         
        var text = $(this).text();
        var textToReplace = $("#description").text();
        var hoverSound = new Audio("hover_sound.mp3");
        switch (text) {
            case "ABOUT ME":
                hoverSound.play();
                var newText = textToReplace.replace(textToReplace, "Take your party directly to About Me to learn more about ONI Base.");
                $("#description").text(newText);
                break;
            case "PROJECTS":
                hoverSound.play();
                var newText = textToReplace.replace(textToReplace, "Come learn about the history of the planet Reach and the events that took place.");
                $("#description").text(newText);
                break;
            case "GALLERY":
                hoverSound.play();
                var newText = textToReplace.replace(textToReplace, "View breath-taking video of Spartans in action.");
                $("#description").text(newText);
                break;
            case "CUSTOMIZATION":
                hoverSound.play();
                var newText = textToReplace.replace(textToReplace, "Customize your Spartan to uniquely identify yourself in the battlefield.");
                $("#description").text(newText);
                break;
            default:
                break;
        };
    }
        
    , function() {
        $( this ).removeClass( "hover" );

    }
    );

$("li").click(
    function() {
        var clickSound = new Audio("select_sound.mp3");
        clickSound.play();
    });