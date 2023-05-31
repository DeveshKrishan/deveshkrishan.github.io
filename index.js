// Audio 
$("#myAudio").get(0).play();

$('#myAudio').prop("volume", 0.15);

// Default case
$("#aboutMe").addClass( "hover" );
let textToReplace = $("#description").text();
let newText = textToReplace.replace(textToReplace, "Take your party directly to About Me to learn more about ONI Base.");
$("#description").text(newText);


// Controls hover interaction with sound, description of item, and such.
$("li").hover(
    function() {
        $("li").removeClass( "hover" );
        $( this ).addClass( "hover" );
         
        let text = $(this).text();
        let textToReplace = $("#description").text();
        let hoverSound = new Audio("hover_sound.mp3");
        switch (text) {
            case "ABOUT ME":
                hoverSound.play();
                newText = textToReplace.replace(textToReplace, "Take your party directly to About Me to learn more about ONI Base.");
                $("#description").text(newText);
                break;
            case "PROJECTS":
                hoverSound.play();
                newText = textToReplace.replace(textToReplace, "Come learn about the history of the planet Reach and the events that took place.");
                $("#description").text(newText);
                break;
            case "GALLERY":
                hoverSound.play();
                newText = textToReplace.replace(textToReplace, "View breath-taking video of Spartans in action.");
                $("#description").text(newText);
                break;
            case "CUSTOMIZATION":
                hoverSound.play();
                newText = textToReplace.replace(textToReplace, "Customize your Spartan to uniquely identify yourself in the battlefield.");
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
        let clickSound = new Audio("select_sound.mp3");
        clickSound.play();
    });