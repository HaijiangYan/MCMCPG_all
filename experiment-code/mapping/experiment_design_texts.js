var consent_text = 
`<h1>We need your consent to proceed</h1>
<hr>
<div class="main_div">
     <p><b>Title</b>: Exploring human representations of facial affect.<br><b>Investigators</b>: Haijiang Yan, Adam Sanborn, Nick Chater, Christian Tsvetkov. </p>

            <p>Welcome and thank you for participating! This research study is on identifying human’s category representations for facial affect. You will be asked to rate a series of faces according to their arousal and valence. In each trial, you will see a face with specific emotion and a grid beneath it. You need to rate the feeling of the face by selecting a position on the rating grid. The experiment will take around 20 minutes to complete. Once finished, you will be eligible for a compensation of 3 pounds.</p>

            <p>We are conducting this research as part of my PhD research and this work is funded by a European Research Council grant (817492-SAMPLING).</p>

            <p>Your participation is completely voluntary. You can withdraw at any time, and for any reason, simply by closing your browser. If you withdraw, your incomplete data will be removed from the dataset completely.</p>

            <p>No identifiable data will be collected from you as part of this study. This means that once your responses have been submitted to the research team, it will not be possible to withdraw this data as your individual responses cannot be identified.</p>

            <p>Data will be securely stored on University of Warwick servers (on an access-restricted drive shared by investigators listed above) and will be processed only for the purpose of scientific analysis.  Access to the data will be restricted to the investigators listed above. Summaries may be presented at conferences and included in scientific publications. Data will be reviewed on completion of the research, in line with the University of Warwick data retention policy. After review, anonymised data will eventually be made openly accessible for future scientific analysis carried out by us or other researchers.</p>

            <p>Please refer to the University of Warwick Research Privacy Notice which is available here: https://warwick.ac.uk/services/idc/dataprotection/privacynotices/researchprivacynotice or by contacting the Information and Data Compliance Team at GDPR@warwick.ac.uk. </p>

            <p>This study has been reviewed and approved by the Department of Psychology Research Ethics Committee at the University of Warwick. If you require further information, please contact Haijiang Yan (haijiang.yan@warwick.ac.uk) or the supervisor Professor Adam Sanborn (a.n.sanborn@warwick.ac.uk).</p>

            <p>Any complaint should be addressed to the person below, who is a senior University of Warwick official entirely independent of this study:
                <br><b>Head of Research Governance</b>
                <br>Research & Impact Services  
                <br>University House, University of Warwick
                <br>Coventry
                <br>CV4 8UW
                <br>Email: researchgovernance@warwick.ac.uk 
                <br>Tel: 024 765 75733
            </p>

            <p>If you wish to raise a complaint on how we have handled your personal data, you can contact our Data Protection Officer who will investigate the matter: DPO@warwick.ac.uk.</p>

            <p>If you are not satisfied with our response or believe we are processing your personal data in a way that is not lawful you can complain to the Information Commissioner's Office (ICO).</p>

            <p>Thank you for taking the time to read this concise Participant Information Leaflet. </p>
     <br>
     <hr>

 <h4>Do you understand and consent to these terms?</h4>

</div>
</div>`;

var prolific_id_page_text = 
` <div style="text-align:left">
    Welcome to the experiment!
    <br><br>Before you start, please switch off phone/ e-mail/ music 
    so you can focus on the study.
    <br><br>Thank you!
    <br><br>Please enter your <b>Prolific ID</b> below:
</div>`


var instruction_text = 
`<div class="main_div">
<h1>Instructions</h1>
<hr>
<p>In this experiment, you will be shown a face that expresses a certain feeling. You will be asked to assess the feeling on the "affect grid" below the face. A typical trial is illustrated below:</p>

        <img src="images/trial.png" style="text-align: center; border: 1px solid #555;" height="530" width="440">

        <p>On the "affect grid", the center square (marked by bold boarder) represents a <strong style="color: red;">neutral, average, everyday feeling</strong>. It is neither positive nor negative. <br><br>The vertical dimension of the "affect grid" represents degree of arousal. Arousal has to do with how <strong style="color: red;">awake, alert, or energetic</strong> a person feels --- no matter whether the feeling is positive or negative; The bottom represents sleep, and the higher you go, the more awake a person feels. If you imagine a state we might call frantic excitement (remembering that it could be either positive or negative),then this feeling would define the top of the grid.<br><br>The right half of the grid represents <strong style="color: red;">pleasant</strong> feelings --- the farther to the right, the more pleasant. The left half represents <strong style="color: red;">unpleasant</strong> feelings --- the farther to the left, the more unpleasant.</p>

        <p>Some examples: </p>

        <img src="images/example.png" style="text-align: center; border: 1px solid #555;" height="250" width="300">

        <br><br>

        <p>In each trial when the face appears, you will click on the square within the "affect grid" you think best describes the face. Try to think about the feeling expressed by the face when making the decision. You will see 220 faces totally, taking 20 minutes approxmately.</p>

        <p>We will firstly have a very brief test to guarantee your understanding of the rules. You can proceed to the formal experiment after finishing the test correctly. </p>

<hr>
</div>`;


var understand_check_text = 
`
<div class="main_div">
        <h1>Test</h1>

        <hr>
            <h4></h4>

            <div id="stimulus">
            <p style="text-align: center; margin-top: 70px; margin-bottom: 0; font-weight: bold;">Extremely high arousal</p>

            <div style="display: inline-block; margin-top: 0; margin-bottom: 0;">

                <p style="display: inline-block; text-align: center; writing-mode: vertical-lr; margin-bottom: 55px; margin-right: 0; font-weight: bold;">Extremely unpleasant</p>

                <table id="grid" style="display: inline-block;"></table>

                <p style="display: inline-block; text-align: center; writing-mode: vertical-lr; margin-bottom: 65px; margin-left: 0; font-weight: bold;">Extremely pleasant</p>

            </div>

            <p style="text-align: center; margin-top: -10px; font-weight: bold;">Extremely sleepy</p>
            </div>

        <hr>

</div>

`;


var instruction2_text =
`
<div>
Great! You will now go on to rate the faces.
<br><br>
</div>
`


var experiment = 
`
<div class="main_div">
    <div id="stimulus">
    <p id="order" style="text-align: center; font-size: 6"></p>
    <div>
        <img id="face_mapping" src="" alt="face" height="96" width="60">
    </div>

    <hr style="width: 500px; background-color: black; height: 1px; border: none;" />
    
        <p style="text-align: center; margin-top: 70px; margin-bottom: 0; font-weight: bold;">Extremely high arousal</p>

        <div style="display: inline-block; margin-top: 0; margin-bottom: 0;">

            <p style="display: inline-block; text-align: center; writing-mode: vertical-lr; margin-bottom: 55px; margin-right: 0; font-weight: bold;">Extremely unpleasant</p>

            <table id="grid" style="display: inline-block;"></table>

            <p style="display: inline-block; text-align: center; writing-mode: vertical-lr; margin-bottom: 65px; margin-left: 0; font-weight: bold;">Extremely pleasant</p>

        </div>

        <p style="text-align: center; margin-top: -10px; font-weight: bold;">Extremely sleepy</p>
    </div>

    <hr>

</div>
`

// var demographic_page_text = 
// `
// <b>Demographic Questions</b>
// <div style="text-align:left">
// Thank you for your participation! 
// <br>We would like you to answer a few questions about yourself. 
// Your responses are totally anonymous and will not affect your payment.
// </div>
// <hr>`

// var demographic_page_questions =
// [{prompt:`Are you fluent in English?`,
//     name:`english_fluency`,
//     options:[`Yes`, `No`],
//     required:false,
//     horizontal:false},
// {prompt:`How was the length of the study`,
//     name:`experiment_length`,
//     options:[`It felt very short`, `It was just right`, `It felt too long`],
//     required:false,
//     horizontal:false},
// {prompt:`Were you able to pay attention throughout`,
//     name:`attention_check`,
//     options:[`It was easy to pay attention throughout the whole study.`, 
//             `It was neither easy nor hard to pay attention.`, 
//             `It was hard to pay attention throughout the whole study.`],
//     required:false,
//     horizontal:false}]


// var debrief_page_text = 
// `<b>Debriefing Form</b>
// <br><br>
// <div style="text-align:left">
    
// </div>`



// var end_of_experiment_text =
// `<div>
// Your payment is $2.00. Your bonus will be paid when
// <br>
// Your Prolific completion code is: CYYC7ADM
// <br>
// <a href='https://app.prolific.co/submissions/complete?cc=CYYC7ADM'>Click here to return to Prolific</a>
// </div>`