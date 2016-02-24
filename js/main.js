$(document).ready(function(){

  // Enable Tooltips

  $('[data-toggle="tooltip"]').tooltip({placement: 'bottom'});

  // -----  

  // Function to update email submission text
  function updateEmail(){

    /* update increases */
    $('ol#submission-increases').html('');
    $('#list-increases > li').each(function(){
      var description = $(this).find('.description').text();
      var value = $(this).find('.value').text().trim();
      $('ol#submission-increases').append('<li>' + description + ' (' + value +' increase)</li>');
    });
 
    /* update decreases */
    $('ol#submission-decreases').html('');
    $('#list-decreases > li').each(function(){
      var description = $(this).find('.description').text();
      var value = $(this).find('.value').text().trim();
      $('ol#submission-decreases').append('<li>' + description + ' (' + value +' decrease)</li>');
    });

    /* update projects */
    $('ol#submission-projects').html('');
    $('#list-projects > li').each(function(){
      var description = $(this).find('.description').text();
      var value = $(this).find('.value').text().trim();
      $('ol#submission-projects').append('<li>' + description + ' (' + value +')</li>');
    });

    /* show submit button */
    $('#submit-button').show();

  }

  // -----

	// Download tool content from Google Sheet and populate webpage

	/* Download content from Google Sheet */
	var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1zcXJcT6ds_JleD27Vq9XKmgSFg4s39Z_msKIGCpFlb0/pubhtml';
  Tabletop.init( { key: public_spreadsheet_url, callback: showContent } );
	
	function showContent(data, tabletop) {

		/* Insert increases data into webpage */
	  var sheetIncreases = tabletop.sheets('Increases').all();
		$(sheetIncreases).each(function(row,rowData){
			var increaseRank = rowData.Rank;
			var increaseType = rowData.Type;
			var increaseAmount = rowData.Amount;
			var increaseDescription = rowData.Description;
			var increaseIcon = 'fa-arrow-up';
			if (increaseType == 'decrease'){ increaseIcon = 'fa-arrow-down'; }
			$('#list-increases').append('<li class="list-group-item" id="increase-' + increaseRank + '"><span class="value"><i class="fa ' + increaseIcon + ' faa-float animated"></i> '+ increaseAmount +'</span><br><span class="description">' + increaseDescription +'</span></li>');
		});

		/* Insert decreases data into webpage */
	  var sheetDecreases = tabletop.sheets('Decreases').all();
		$(sheetDecreases).each(function(row,rowData){
			var decreaseRank = rowData.Rank;
			var decreaseType = rowData.Type;
			var decreaseAmount = rowData.Amount;
			var decreaseDescription = rowData.Description;
			var decreaseIcon = 'fa-arrow-down';
			if (decreaseType == 'increase'){ decreaseIcon = 'fa-arrow-up'; }
			$('#list-decreases').append('<li class="list-group-item" id="decrease-' + decreaseRank + '"><span class="value"><i class="fa ' + decreaseIcon + ' faa-float animated"></i> '+ decreaseAmount +'</span><br><span class="description">' + decreaseDescription +'</span></li>');
		});

		/* Insert new projects data into webpage */
	  var sheetDecreases = tabletop.sheets('NewProjects').all();
		$(sheetDecreases).each(function(row,rowData){
			var projectID = rowData.ID;
			var projectCost = rowData.Cost;
			var projectDescription = rowData.Description;
			$('#list-projects').append('<li class="list-group-item" id="project-' + projectID + '"><span class="value"><i class="fa fa-money"></i> '+ projectCost +'</span><br><span class="description">' + projectDescription +'</span></li>');
		});

		/* Remove loading icon */
		$('.loading').remove();

    /* update email text */
    updateEmail();

	}

	// -----

	// Manage sortable lists (using SortableJS)

	/* Increases List */	
	var listIncreases = document.getElementById('list-increases');
	Sortable.create(listIncreases, { animation: 300, onEnd: updateEmail });

	/* Decreases List */	
	var listDecreases = document.getElementById('list-decreases');
	Sortable.create(listDecreases, { animation: 300, onEnd: updateEmail });

	/* Pojects List */	
	var listProjects = document.getElementById('list-projects');
	Sortable.create(listProjects, { animation: 300, onEnd: updateEmail });	

  // -----

	// Manage submission

  /* Send to parliament 'yes' button */
	$('.question#submit-parliament > .btn-agree').click(function(event){
		event.preventDefault();
		$('.question#submit-parliament > .btn-disagree').removeClass('btn-selected');
		$(this).addClass('btn-selected');
		$('#parliament-submission').slideDown();
	});

  /* Send to parliament 'no' button */
  $('.question#submit-parliament > .btn-disagree').click(function(event){
    event.preventDefault();
    $('.question#submit-parliament > .btn-agree').removeClass('btn-selected');
    $(this).addClass('btn-selected');
    $('#parliament-submission').slideUp();
  });

  /* Submit button */
  $('#btn-submit').click(function(event){

    event.preventDefault();
    $(this).html('<i class="fa fa-cog fa-spin"></i>');   

    var increasesOrder = [];
    $('#list-increases > li').each(function(){
      var increaseID = $(this).attr('id').split('-').pop();
      increasesOrder.push(increaseID);
    });

    var decreasesOrder = [];
    $('#list-decreases > li').each(function(){
      var decreaseID = $(this).attr('id').split('-').pop();
      decreasesOrder.push(decreaseID);
    });

    var projectsOrder = [];
    $('#list-projects > li').each(function(){
      var projectID = $(this).attr('id').split('-').pop();
      projectsOrder.push(projectID);
    });   

    var userEmail = $('#email-address > input').val();

    function submitSuccess(){
      $('#btn-submit').html('Submitted <i class="fa fa-check">').addClass('submitted');
    }

    function sendEmail(){
      var sendEmailSelected = $('#submit-parliament > .btn-selected').hasClass('btn-selected');
      if (sendEmailSelected == true){
        var emailBody = $('#parliament-email').html();
        console.log(emailBody);
        $.post("http://backchat.code4sa.org/submit/budget2016/notice", {processData: false, success: submitSuccess, data: JSON.stringify({EmailBody: emailBody, UserEmail: userEmail})}); 
      }
      else {
        submitSuccess();
      }     
    }

    $.post("http://backchat.code4sa.org/submit/budget2016/", {processData: false, success: sendEmail, data: JSON.stringify({IncreasesOrder: increasesOrder, DecreasesOrder: decreasesOrder, ProjectsOrder: projectsOrder, UserEmail: userEmail})});

  });  

});