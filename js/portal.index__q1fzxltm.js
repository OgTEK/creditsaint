
var timeLineListTable = new clientTable('timeLine_list');

timeLineListTable.lineTemplate = function (val) {
    var $line = $('<tr data-id="' + val.id + '"/>');

    $line.append(
        '<td>' + val.created_at_text + '</td>' +
        '<td>' + val.statement + '</td>' +
        '<td class="text-muted">' + val.comments + '</td>' +
        '<td><strong>' + val.user_name + '</strong></td>'
    );

    return $line;
};
var progressListTable = new clientTable('progress_list');
progressListTable.singlePage = true;
progressListTable.lineTemplate = function (val) {
    var $line = $('<tr data-id="' + val.id + '"/>');
	if (val.header == true){
		$line.append(
		    '<td class="bureau-header" colspan="3"><h3>' + val.title + '</h3></td>' +
		    '<td class="bureau-header"><h3><strong>' + val.counter + '</strong></h3></td>'
		);
	}else{
		$line.append(
		    '<td>' + val.title + '</td>' +
		    '<td>' + val.initial_score + '</td>'+
		    '<td>' + val.current_score + '</td>'+
		    '<td>&nbsp;</td>'
		);
	}
    

    return $line;
};

var portalCore = {
    start: function (){

    },

    alert: function (type, message, title) {
        if (message || title) {
            $.notify({message: message, title:title}, {type: type, z_index: 1090});
        }
    },

    updateTimeLineList: function () {
        timeLineListTable.get(1, true);
    },
	updateProgressList: function () {
	    progressListTable.get(1, true);
	},
};




/*--------------------------------------------------------------------------------------------------------------------*/


jQuery(function($) {
    $('[data-toggle="tooltip"]').tooltip();

    $.ajaxSetup({
        headers: {
            'X-XSRF-TOKEN': window.Laravel.csrfToken
        }
    });

    $('body').on('click', 'a.fullText-a', function () {
        $('#modal-fullText-body').empty().html($(this).parent().find('div.fullText-div').html());

        $('#modal-fullText').modal('show');

        $(this).blur();

        return false;
    });

    $('#modal-fullText').modal({
        show: false
    }).on('hide.bs.modal', function () {
        $('#modal-fullText-body').empty();
    });



    $('#modal-timeLine').on('show.bs.modal', function (e) {
        $('#modal-timeLine-form').find('input[type="text"],textarea').val('').filter('[name="tell_attorney_text"],[name="tell_advocate_text"]').prop('required', null).hide();
        $('#modal-timeLine-form').find('input[type="checkbox"]').prop('checked', null);

        if ($('#client-fields select[name="sales_id"]').val()) {
            $('#tell_sales_div').show();
        } else {
            $('#tell_sales_div').hide();
        }

        if ($('#client-fields select[name="attorney_id"]').val()) {
            $('#tell_attorney_div').show();
        } else {
            $('#tell_attorney_div').hide();
        }
    });

   
    $('#action_list-body, #timeLine_list-body').on('click', 'td.action-description.action-fulltext', function () {
        var $textArea = $(this).parent().find('textarea');
        var $text = $(this).find('div');

        $text.hide();

        $textArea.off('blur').on('blur', function () {
            $textArea.hide();
            $text.show();
        });

        $textArea.show();
        $textArea.focus().scrollTop(0);
    });

    timeLineListTable.start();
    progressListTable.start();
	
	/*----------- billing --------- */
	if ($('#payment-info').length) {
		var $form = $('#payment-info');

		$('#billing_zip').mask('00000');
		$('#f_card_number').mask('0000-0000-0000-0000');
		$('#f_card_code').mask('0000');
		$('#f_card_date').mask('00/00');

		$('#payment-send').on('click', function () {
			var error = false;
			var $firstErrorField = null;

			$form.find('.form-group').removeClass('has-danger has-success');
			$form.find('.form-control').removeClass('form-control-danger form-control-success');
			$form.find('.form-control-feedback').addClass('hidden');

			$.each($form.find('.form-control,.form-select'), function () {
				var $group = $(this).closest('.form-group').first();
				var $fieldFeedback = $group.find('.form-control-feedback');
				var check = false;

				if ($(this).val()) {
					switch ($(this).attr('name')) {

						case 'billing_address':
						case 'billing_city':
							if (/^([a-zA-Z0-9_.,:+-\/\\ ]){2,}$/.test($(this).val())) {
								check = true;
							}
							break;
						case 'billing_zip':
							if (/^([0-9]){5}$/.test($(this).val())) {
								check = true;
							}
							break;
						case 'card_number':
							if (/^([0-9]){4}\-([0-9]){4}\-([0-9]){4}\-([0-9]){4}$/.test($(this).val())) {
								check = true;
							}
							if (/^([0-9]){4}\-([0-9]){4}\-([0-9]){4}\-([0-9]){3}$/.test($(this).val())) {
								check = true;
							}
							break;
						case 'card_code':
							if (/^([0-9]){3,}$/.test($(this).val())) {
								check = true;
							}
							break;
						case 'card_date':
							if (/^([0-9]){2}\/([0-9]){2}$/.test($(this).val())) {
								check = true;

								var dateParts = $(this).val().split('/');
								var month = parseInt(dateParts[0], 10);
								var year = dateParts[1];

								$('#f_card_date_month').val(month);
								$('#f_card_date_year').val("20" + year);
							}
							break;

						default:
							check = true;
							break;
					}
				}

				if (check) {
					$group.addClass('has-success');
					$(this).addClass('form-control-success');
				} else if ($(this).prop('required')) {
					$group.addClass('has-danger');
					$(this).addClass('form-control-danger');
					$fieldFeedback.removeClass('hidden');

					if (!$firstErrorField) {
						$firstErrorField = $group
					}

					error = true;
				}
			});

			if (error) {
				$('html, body').animate({
					scrollTop: $firstErrorField.offset().top - 50
				}, 1000);

				return false;
			} else {
				$(this).text('Please wait...').attr('disabled', 'disabled');

				$form.submit();
			}
		});
		$('#f_billing_address').keyup(function () {
			$('#address_validate').val('0');
		});
		$('#f_billing_city').keyup(function () {
			$('#address_validate').val('0');
		});
		$('#f_billing_state').change(function () {
			$('#address_validate').val('0');
		});
		$('#f_billing_zip').keyup(function () {
			$('#address_validate').val('0');
		});
	}
	if($('#sendtext').length){
		$('#sendtext').bootstrapToggle();
		$('#sendtext').change(function(){
			$('#alerts').submit();
		});
		$('#cell_phone').mask('+1(000)000-0000', {placeholder: "+1(___)___-____"});
	}
	/* --------- utils -------------- */

	// Show when there is no data or similar states

	function showErrorState($container) {
		const errorHtml = `
			<div class="no-data__wrapper">
				<div class="no-data__img"></div>
				<div class="no-data__message">
					No data available 
				</div>
			</div>`;
		$container.html(errorHtml);
	}
	
	/* --------- score chart -------------- */
	
	$.each($('div.chart-container'), function () {
		var $container = $(this);
		$container.addClass('loading');
		$.ajax({
            url: $container.attr('data-url'),
			type: 'GET',
			dataType: 'json',
			cache: false,
			success: function (data) {
				$container.removeClass('loading');

				if (!data.chart || data.chart.length === 0) {
					showErrorState($container);
					return;
				}

				var chart = am4core.create($container.attr('id'), am4charts.XYChart);
				chart.paddingRight = 0;
				chart.paddingLeft = 0;
				chart.data = data.chart;

				var dateAxis = chart.xAxes.push(new am4charts.DateAxis());

				dateAxis.renderer.grid.template.disabled = true;

				var horizontalLine = dateAxis.renderer.gridContainer.createChild(am4core.Line); 
				horizontalLine.stroke = am4core.color("#A1A1A1");
				horizontalLine.strokeOpacity = 0.5;
				horizontalLine.width = am4core.percent(100);
				horizontalLine.align = "center";
				horizontalLine.isMeasured = false;
				horizontalLine.x = am4core.percent(50);
				horizontalLine.y = 0;

				function positionHorizontalLine(horizontalLine, y) {
					horizontalLine.y = y;
					horizontalLine.validatePosition();
				}

				dateAxis.events.on("gridtemplated", function(ev) {
					var grid = ev.target;
					if (grid.element) {
						positionHorizontalLine(horizontalLine, grid.pixelY);
					}
				});
				dateAxis.cursorTooltipEnabled = false;
				dateAxis.renderer.minGridDistance = 25;

				dateAxis.dateFormats.setKey("day", "MMMM dt");
				dateAxis.renderer.labels.template.fill = am4core.color("#A1A1A1");
			  
				dateAxis.renderer.labels.template.adapter.add("text", function(text, target) {
					var dataItem = target.dataItem;
					if (dataItem && dataItem.date) {
					  var date = dataItem.date;
					  var index = target.dataItem.index;
					  if (index % 4 === 0) {
						return date.toLocaleString('default', { month: 'short' }) + "\n" + date.getFullYear();
					  } else {
						return "";
					  }
					} else {
					  return "";
					}
				  });
				
				var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
				valueAxis.renderer.minWidth = 40;
				valueAxis.cursorTooltipEnabled = false;
				valueAxis.renderer.labels.template.fill = am4core.color("#A1A1A1");
				valueAxis.renderer.labels.template.fontSize = 18;
	
				function createSeries(name, field) {
					am4core.addLicense("ch-custom-attribution");
					
					var series = chart.series.push(new am4charts.LineSeries());
					series.dataFields.valueY = field;
					series.dataFields.dateX = "n";
					series.tensionX = 0.9;
  					series.tensionY = 0.9;
					series.name = name;
					series.tooltipText = "[bold]{valueY}[/]\n{dateX.formatDate('M/d/yy')}";
					series.strokeWidth = 2;
					
					series.tooltip.getFillFromObject = false;
					series.tooltip.background.fill = am4core.color("#fff");
					series.tooltip.background.stroke = am4core.color("#CBCBCB");
					series.tooltip.background.strokeWidth = 1;
					series.tooltip.label.fill = am4core.color("#232323");
					series.tooltip.label.fontSize = 20;
					series.tooltip.background.cornerRadius = 8;
					series.tooltip.pointerOrientation = "vertical";
					series.tooltip.label.minWidth = 77;
					series.tooltip.label.minHeight = 57;
					series.tooltip.label.textAlign = "middle";
					series.tooltip.label.textValign = "middle";

					var gradient = new am4core.LinearGradient();
					gradient.addColor(am4core.color("#74A3C2"), 1);
					gradient.addColor(am4core.color("#FFFFFF"), 0);
					gradient.rotation = 90;

					series.fill = gradient;
					series.fillOpacity = 0.8;
					series.stroke = "#74A3C2";

					var bullet = series.bullets.push(new am4charts.CircleBullet());
					bullet.circle.strokeWidth = 1;
					bullet.circle.radius = 3;
					bullet.circle.fill = am4core.color("#fff");
					bullet.circle.stroke = am4core.color("#74A3C2");

					var hoverState = bullet.states.create("hover");
					hoverState.properties.scale = 1.8;
					hoverState.properties.strokeWidth = 2;
					hoverState.properties.stroke = am4core.color("#74A3C2");
				}
	
				// Create each series
				createSeries("Equifax", "equifax");
				createSeries("Experian", "experian");
				createSeries("Transunion", "transunion");
	
				chart.cursor = new am4charts.XYCursor();
				chart.cursor.behavior = "panX";
			},
			error: function (xhr, status, error) {
				$container.removeClass('loading');
				showErrorState($container);
			}
		});
	});

	$("div.score-container-item").each(function () {
		var $container = $(this);
		var $bureauLogo = $container.find('.bureau-logo');
		var chartId = $container.find('div[id^="chartdiv"]').attr("id"); // Get the chart div ID
		var dataUrl = $container.data("url"); // Get the data-url attribute
		
		var $squadBlock = $('.squad-offer-block');
		var $squadOfferLink = $squadBlock.find('a');
		var $creditSquadLink = 'https://www.creditsquad.com/?pid=98E8ECB7';

		$container.addClass('loading');
		if (dataUrl) {
			$.ajax({
				url: $container.attr('data-url'),
				type: "GET",
				dataType: "json",
				cache: false,
				success: function (data) {
					if (data.score && data.score !== "N/A") {
						var rating = getRating(parseInt(data.score, 10));
						$container.removeClass('loading');
						$bureauLogo.removeClass('d-none');
						$('#single_score').text(data.score);
						$('#single_score_rating').text(rating);
						$('#single_score_date').text(data.score_date);
						createRadarChart(chartId, data.score);

						if (data.sso && data.sso.redirect_url) {
							$squadOfferLink.attr('href', data.sso.redirect_url);
						} else {
							$squadOfferLink.attr('href', $creditSquadLink);
						}
					} else if (!data.score) {
						var bureau = chartId.split('-')[1];

						if (data[bureau] && data[bureau].score !== "N/A") {
							$container.removeClass('loading');
							$bureauLogo.removeClass('d-none');
							createRadarChart(chartId, data[bureau].score); 
							$("#" + bureau + "_score").text(data[bureau].score);
							$("#" + bureau + "_score_rating").text(getRating(parseInt(data[bureau].score, 10)));
							$("#" + bureau + "_score_date").text(data[bureau].score_date);
						} else {
							$container.removeClass('loading');
							showErrorState($container);
						}
				
						if (data.sso && data.sso.redirect_url) {
							$squadOfferLink.attr('href', data.sso.redirect_url);
						} else {
							$squadOfferLink.attr('href', $creditSquadLink);
						}
					} else {
						$container.removeClass('loading');
						showErrorState($container);
					}
				},
				error: function () {
					showErrorState($container);

					$container.removeClass('loading');
				}
			});
		} else {
			$container.removeClass('loading');
			showErrorState($container);
		}

		function getRating(score) {
			switch (true) {
				case (score < 580):
					return 'Poor';
				case (score < 670):
					return 'Fair';
				case (score < 740):
					return 'Good';
				case (score < 800):
					return 'Very Good';
				default:
					return 'Excellent';
			}
		}

		function showNoDataMessage($container, bureau) {
			$container.html(`<span class="no-data-text">No ${bureau} score data available.</span>`); 
		}
	});

	function createRadarChart(chartId, score) {
		am4core.addLicense("ch-custom-attribution");
		am4core.useTheme(am4themes_animated);
		var chart = am4core.create(chartId, am4charts.RadarChart);

		chart.data = [{
			"category": "Credit Score",
			"value": score,
			"full": 850
		}];

		chart.radius = am4core.percent(93); 

		chart.numberFormatter.numberFormat = "#.#";
	
		var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "category";
		categoryAxis.renderer.labels.template.disabled = true;
		categoryAxis.renderer.grid.template.strokeOpacity = 0;
	
		var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
		valueAxis.renderer.labels.template.disabled = true;
		valueAxis.renderer.grid.template.strokeOpacity = 0;
		valueAxis.min = 0;
		valueAxis.max = 850;
	
		var series1 = chart.series.push(new am4charts.RadarColumnSeries());
		series1.dataFields.valueX = "full";
		series1.dataFields.categoryY = "category";
		series1.clustered = false;
		series1.columns.template.fill = am4core.color("#EAEAEA");
		series1.columns.template.strokeWidth = 5;
		series1.columns.template.stroke = am4core.color("white");
		series1.columns.template.radarColumn.cornerRadius = 20;
		series1.columns.template.width = am4core.percent(72);

		var series2 = chart.series.push(new am4charts.RadarColumnSeries());
		series2.dataFields.valueX = "value";
		series2.dataFields.categoryY = "category";
		series2.clustered = false;
		series2.columns.template.fill = am4core.color("#74A3C2");
		series2.columns.template.strokeWidth = 5;
		series2.columns.template.radarColumn.cornerRadius = 20;
		series2.columns.template.stroke = am4core.color("white");
		series2.strokeLinecap = "round";
		series2.bulletsContainer.zIndex = 10;
		series2.columns.template.width = am4core.percent(72);

		var bullet = series2.bullets.push(new am4core.Circle());

		bullet.fill = am4core.color("white"); 
		bullet.stroke = am4core.color("#74A3C2");
		bullet.adapter.add("radius", function (radius, target) {
			var chartWidth = chart.pixelWidth;
			var chartHeight = chart.pixelHeight;
			var smallestDimension = Math.min(chartWidth, chartHeight);

			return smallestDimension * 0.033;
		});
		
		chart.startAngle = 180;
		chart.endAngle = 420;
		// bullet.radius = 5;
		bullet.fill = am4core.color("white"); 
		bullet.stroke = am4core.color("#74A3C2");
		bullet.strokeWidth = 2; 
		chart.innerRadius = am4core.percent(67);
		bullet.dy = 1;

		bullet.verticalCenter = "bottom";
		bullet.horizontalCenter = "bottom";

		bullet.adapter.add("dx", function(dx, target) {
			return -target.radius; 
		});
	}

	$('#signup, #squad-send').click(function(){
		$('#signup_option').val('1');
		$(this).prop('disabled', 'disabled');
		$("#signup_form").submit();
	});
	$('#no_signup').click(function(){
		$("#signup_form").submit();
	});
	
	$('.choose-package').each(function(){
		$(this).click(function(){
			$(this).prop('disabled', 'disabled');
			$('#choose-squad').val($(this).attr('data-package'));
			$("#signup_form").submit();
		});
	});
	$('input[name="payment_type"]').each(function(){
		$(this).unbind();
		$(this).click(function(){
			if($(this).val() == '1'){
				$('#newpayment').css('display', 'flex');
			}else{
				$('#newpayment').css('display', 'none');
			}
		});
	});
	if($('#newpayment').length){
		 var $form = $('#signup_form');
		
		$('#billing_zip').mask('00000', {placeholder: "_____"});
		$('#card_number').mask('0000-0000-0000-0000', {placeholder: "____-____-____-____"});
		$('#card_code').mask('0000', {placeholder: "___"});
		$('#squadpayment-send').on('click', function () {
	        var error = false;
	        var $firstErrorField = null;
	
	        $form.find('.form-group').removeClass('has-danger has-success');
	        $form.find('.form-control').removeClass('form-control-danger form-control-success');
	        $form.find('.form-control-feedback').addClass('hidden');
	
	        $.each($form.find('.form-control'), function () {
	            var $group = $(this).closest('.form-group').first();
	            var $fieldFeedback = $group.find('.form-control-feedback');
	            var check = false;
	
	            if ($(this).val()) {
	                switch ($(this).attr('name')) {
	                    
	                    case 'billing_address':
	                    case 'billing_city':
	                        if (/^([a-zA-Z0-9_.,:+-\/\\ ]){2,}$/.test($(this).val())) {
	                            check = true;
	                        }
	                        break;
	                    case 'billing_zip':
	                        if (/^([0-9]){5}$/.test($(this).val())) {
	                            check = true;
	                        }
	                        break;
	                    case 'card_number':
	                        if (/^([0-9]){4}\-([0-9]){4}\-([0-9]){4}\-([0-9]){4}$/.test($(this).val())) {
	                            check = true;
	                        }
							if (/^([0-9]){4}\-([0-9]){4}\-([0-9]){4}\-([0-9]){3}$/.test($(this).val())) {
							    check = true;
							}
	                        break;
	                    case 'card_code':
	                        if (/^([0-9]){3,}$/.test($(this).val())) {
	                            check = true;
	                        }
	                        break;
	                    default:
	                        check = true;
	                        break;
	                }
	            }
	
	            if (check) {
	                $group.addClass('has-success');
	                $(this).addClass('form-control-success');
	            } else if ($(this).prop('required') && $('#newpay').prop('checked') == 'checked') {
	                $group.addClass('has-danger');
	                $(this).addClass('form-control-danger');
	                $fieldFeedback.removeClass('hidden');
	
	                if (!$firstErrorField) {
	                    $firstErrorField = $group
	                }
	
	                error = true;
	            }
	        });
	
	        if (error) {
	            $('html, body').animate({
	                scrollTop: $firstErrorField.offset().top - 50
	            }, 1000);
	
	            return false;
	        } else {
	            $(this).text('Please wait...').attr('disabled', 'disabled');
	
	             $form.submit();
	                   
	            
	        }
	    });
		
	}
	$('#appt-calendar').datepicker({
	    beforeShowDay: nationalDays,
		startDate: new Date(),
		daysOfWeekDisabled: [0,6],
		orientation: "bottom"
	});
	$('#callme-appt-btn').click(function(){
		$('#callme-buttons').slideUp();
		$('#callme-appt').slideDown();
	});
	$('#callme').click(function(){
		 var this_ = this;
		 var url = $(this).attr('data-url') ?? '';

		 // Defensive validation: ensure URL exists and is valid
		 if (typeof url !== 'string' || url.trim() === '') {
			 console.error('Invalid or missing data-url attribute on #callme button');
			 return false;
		 }

		 $(this).prop('disabled', 'disabled');
		 $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: {
				_token: window.Laravel.csrfToken
            },
            success: function (data) {
                $(this_).prop('disabled', false);
				if(data.success){
					
					alertify.confirm('Success!', 'We will call you shortly as soon as the next specialist is available.', function(){ 
	        			
	                    $('[data-toggle="tooltip"]').tooltip('hide');
	                			
	        		}, function(){ 
						cancelAppointment('call');
					}).show();
				}else if(data.error){
					alertify.alert('An error occurred.', data.message);
				}
            },
			
			error: function (xhr, status, thrownError) {
				$(this_).prop('disabled', false);
				alertify.alert('An unexpected error occurred.', xhr.status + " " + thrownError);

			}
        });
	});
	$('#appt-submit').click(function(){
		 var this_ = this;
		 var url = $(this).attr('data-url') ?? null;

		 // Defensive validation: ensure URL exists and is valid
		 if (typeof url !== 'string' || url.trim() === '') {
			 console.error('Invalid or missing data-url attribute on #appt-submit button:', this);
			 return false;
		 }

		 $(this).prop('disabled', 'disabled');
		 $.ajax({
	        url: url,
	        type: 'POST',
	        dataType: 'json',
	        data: {
				_token: window.Laravel.csrfToken,
				'date' : $('#appt-calendar').val(),
				'time_block' : $('#appointment-options').val()
	        },
	        success: function (data) {
	            $(this_).prop('disabled', false);
				if(data.success){
					
					alertify.confirm('Success!', data.message, function(){ 
	        			
	                    $('[data-toggle="tooltip"]').tooltip('hide');
	                			
	        		}, function(){ 
						cancelAppointment('appointment');
					}).show();
				}else if(data.error){
					alertify.alert('An error occurred.', data.message);
				}
	        },
			
			error: function (xhr, status, thrownError) {
				$(this_).prop('disabled', false);
				alertify.alert('An unexpected error occurred.', xhr.status + " " + thrownError);
	
			}
	    });
	 }); 
	 
	 $('#progress').each(function(){
	 	var this_ = this;
		var errorDiv = $('<div>', {
			class: 'progress-error',
			text: 'An error occurred loading your progress.'
		});

		$.ajax({
	        url: $(this).attr('data-url'),
	        type: 'GET',
	        dataType: 'json',
	        success: function (data) {
	            $(this_).removeClass('loading');
                $('#progress-summary').removeClass('loading');
				if(data.error){
					$(this_).html(errorDiv);
					alertify.alert('An unexpected error occurred loading your progress.', data.error);
				}else{
                    let summaryTabs = "";
					let progressReportTabs = "";
					let summaryContent = `<div class="tab-content" id="pills-tabContent">`;
					let progressReportContent = `<div class="tab-content" id="progressReport-pills-tabContent">`;
					let legacyProgressReportEnabled = data.legacy_progress_report ?? false;

					if(data.experian){
						var nextupdate = '';
						if(parseInt(data.experian_update) > 0){
							nextupdate = '<span class="progress-report__update">Next update in '+data.experian_update+' Days</span>';
						}
						if (!legacyProgressReportEnabled) { patchBureauCounts(data.experian); }
						$(this_).append('<h5 class="progress-report__bureau-name"><span>Experian</span>' + nextupdate + '</h5>' + parseProgress(data.experian, data));
                        summaryTabs += ` <li class="nav-item" role="presentation">
                        <button class="nav-link active report_tab_btn" id="pills-experian-tab" data-bs-toggle="pill" data-bs-target="#pills-experian" type="button" role="tab" aria-controls="pills-experian" aria-selected="true">Experian</button>
                        </li>`;
                        summaryContent += `<div class="tab-pane fade show active" id="pills-experian" role="tabpanel" aria-labelledby="pills-experian-tab">`;
                        summaryContent += renderBureauSummary('experian', data.experian, data);
                        summaryContent += `</div>`;

						progressReportTabs += ` <li class="nav-item" role="presentation">
                        <button class="nav-link active report_tab_btn" id="pills-pr-experian-tab" data-bs-toggle="pill" data-bs-target="#pills-pr-experian" type="button" role="tab" aria-controls="pills-pr-experian" aria-selected="true">Experian</button>
                        </li>`;
						progressReportContent += `<div class="tab-pane fade show active" id="pills-pr-experian" role="tabpanel" aria-labelledby="pills-experian-tab">`;
						progressReportContent += parseReportProgress(data.experian, data);
						progressReportContent += `</div>`;

					}
					if(data.transunion){
						var nextupdate = '';
						if(parseInt(data.transunion_update) > 0){
							nextupdate = '<span class="progress-report__update">Next update in '+data.transunion_update+' Days</span>';
						}
						if (!legacyProgressReportEnabled) { patchBureauCounts(data.transunion); }
						$(this_).append('<h5 class="progress-report__bureau-name"><span>TransUnion</span>' + nextupdate + '</h5>' + parseProgress(data.transunion, data));
                        summaryTabs += ` <li class="nav-item" role="presentation">
                        <button class="nav-link report_tab_btn" id="pills-transunion-tab" data-bs-toggle="pill" data-bs-target="#pills-transunion" type="button" role="tab" aria-controls="pills-transunion" aria-selected="true">Transunion</button>
                        </li>`;
                        summaryContent += `<div class="tab-pane fade" id="pills-transunion" role="tabpanel" aria-labelledby="pills-transunion-tab">`;
                        summaryContent += renderBureauSummary('transunion', data.transunion, data);
                        summaryContent += `</div>`;
						progressReportTabs += ` <li class="nav-item" role="presentation">
                        <button class="nav-link report_tab_btn" id="pills-pr-transunion-tab" data-bs-toggle="pill" data-bs-target="#pills-pr-transunion" type="button" role="tab" aria-controls="pills-pr-transunion" aria-selected="true">Transunion</button>
                        </li>`;
						progressReportContent += `<div class="tab-pane fade" id="pills-pr-transunion" role="tabpanel" aria-labelledby="pills-pr-transunion-tab">`;
						progressReportContent += parseReportProgress(data.transunion, data);
						progressReportContent += `</div>`;
					}
					if(data.equifax){
						var nextupdate = '';
						if(parseInt(data.equifax_update) > 0){
							nextupdate = '<span class="progress-report__update">Next update in '+data.equifax_update+' Days</span>';
						}
						if (!legacyProgressReportEnabled) { patchBureauCounts(data.equifax); }
						$(this_).append('<h5 class="progress-report__bureau-name"><span>Equifax</span>' + nextupdate + '</h5>' + parseProgress(data.equifax, data));
                        summaryTabs += ` <li class="nav-item" role="presentation">
                        <button class="nav-link report_tab_btn" id="pills-equifax-tab" data-bs-toggle="pill" data-bs-target="#pills-equifax" type="button" role="tab" aria-controls="pills-equifax" aria-selected="true">Equifax</button>
                        </li>`;
                        summaryContent += `<div class="tab-pane fade" id="pills-equifax" role="tabpanel" aria-labelledby="pills-equifax-tab">`;
                        summaryContent += renderBureauSummary('equifax', data.equifax, data);
                        summaryContent += `</div>`;
						progressReportTabs += ` <li class="nav-item" role="presentation">
                        <button class="nav-link report_tab_btn" id="pills-pr-equifax-tab" data-bs-toggle="pill" data-bs-target="#pills-pr-equifax" type="button" role="tab" aria-controls="pills-pr-equifax" aria-selected="true">Equifax</button>
                        </li>`;
						progressReportContent += `<div class="tab-pane fade" id="pills-pr-equifax" role="tabpanel" aria-labelledby="pills-pr-equifax-tab">`;
						progressReportContent += parseReportProgress(data.equifax, data);
						progressReportContent += `</div>`;
					}
					$('.progress-type').click(function(){
						$(this).find('.progress-caret').toggleClass('open');
						$(this).find('.progress-header').toggleClass('open');
						$(this).find('.progress-body').slideToggle();
					});
                    summaryContent += ` </div>`;
					progressReportContent += ` </div>`;
                    let summaryReport = `<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">` + summaryTabs+ `</ul>` + summaryContent ;
					let progressReport = `<ul class="nav nav-pills mb-3" id="pills-pr-tab" role="tablist">` + progressReportTabs+ `</ul>` + progressReportContent ;
                    $('#progress-summary').html(summaryReport);
					if (!legacyProgressReportEnabled) {
						$('#progress').html(progressReport);
					}
				}
	        },
			
			error: function (xhr, status, thrownError) {
				$(this_).removeClass('loading');
				$(this_).html(errorDiv);
				alertify.alert('An unexpected error occurred loading your progress.', xhr.status + " " + thrownError);
	
			}
	    });
	 	
	 });
	 $('#portal-cancel-link').click(function(){
	 	$(this).slideUp();
	 	$('#portal-cancel-options').slideDown();
	 });
	 $('#portal-cancel-options input[name="cancel_reason"]').change(function(){
	 	if ($('input[name="cancel_reason"]:checked').val() == '14') {
           $('textarea[name="cancel_reason_other"]').css('display', 'block');
        }else{
			$('textarea[name="cancel_reason_other"]').css('display', 'none');
		}
	 });
	 $('#cancel-send').on('click', function () {
        var $form = $('#cancel-form');
		var error = false;
        var $firstErrorField = null;

        $form.find('.form-group').removeClass('has-danger has-success');
        $form.find('.form-check').removeClass('form-control-danger form-control-success');
        $form.find('.form-control-feedback').addClass('hidden');

       
           
        if (!$('input[name="cancel_reason"]').is(":checked")) {
			var $group = $('#cancel-form .form-group');
			var $fieldFeedback = $group.find('.form-control-feedback');
		
			$group.addClass('has-danger');
            $('input[name="cancel_reason"]').addClass('form-control-danger');
            $fieldFeedback.removeClass('hidden');

            if (!$firstErrorField) {
                $firstErrorField = $group
            }

            error = true;
		}
             

        if (error) {
            

            return false;
        } else {
            $(this).text('Please wait...').attr('disabled', 'disabled');

             $form.submit();
                   
            
        }
    });
	$('#chat-reply-submit').click(function(){
		$.ajax({
            url: $(this).attr('data-submit-url'),
            type: 'POST',
            dataType: 'json',
            data: {
                _token: window.Laravel.csrfToken,
                message: $('#chat-reply-form').val()
            },
            success: function (data) {
               
			   $('#chat-reply-form').val('');
			   outputMessages(data);
            }
        });
	});
	$('#chat-reply-form').focus(function(){
		loadConcierge(1);
	});
	loadConcierge();

	
});
natDays = [
	[7, 4, 'us'],
	[11, 26, 'us'],
	[12, 25, 'us']
];

function nationalDays(date) {
    for (i = 0; i < natDays.length; i++) {
      if (date.getMonth() == natDays[i][0] - 1
          && date.getDate() == natDays[i][1]) {
        return [false, natDays[i][2] + '_day'];
      }
    }
  return [true, ''];
}
function cancelAppointment(type){
	 $.ajax({
        url: $('#callme-appt').attr('data-cancel-url'),
        type: 'POST',
        dataType: 'json',
        data: {
			_token: window.Laravel.csrfToken,
			'type' : type
        },
        success: function (data) {
           
			if(data.success){
				alertify.alert('Call Cancelled.', data.message);
			}else if(data.error){
				alertify.alert('An error occurred.', data.message);
			}
        },
		
		error: function (xhr, status, thrownError) {
			
			alertify.alert('An unexpected error occurred.', xhr.status + " " + thrownError);

		}
    });
}

function patchBureauCounts(bureauData) {
	if (!bureauData?.DEROGATORY_ITEMS?.length) return;
	const chargesToPurge = ["CHARGEOFF_COLLECTION", "REPOSSESSION_FORECLOSURE"];
	let purgedItems = bureauData.DEROGATORY_ITEMS;
	chargesToPurge.forEach(damage => {
		purgedItems = purgeDupesChargesByDamage(purgedItems, damage);
	});
	const grouped = groupByAccountWithCounters(purgedItems);
	const counts = {};
	grouped.forEach(account => {
		account.damages.forEach(dmg => {
			if (!counts[dmg.damage]) counts[dmg.damage] = { challenged: 0, removed: 0 };
			if (dmg.removed) {
				counts[dmg.damage].removed += 1;
			} else if (dmg.was_challenged) {
				counts[dmg.damage].challenged += 1;
			}
		});
	});
	Object.entries(counts).forEach(([damage, { challenged, removed }]) => {
		if (bureauData[damage]) {
			bureauData[damage].challenged = challenged;
			bureauData[damage].removed = removed;
		}
	});
}

// Bureau keys that hold a damage type; SUMMARY / SUMMARY_META never are, and the
// item lists only count as damage sections in legacy mode.
function isDamageSection(key, full) {
	if (key === "SUMMARY" || key === "SUMMARY_META") {
		return false;
	}
	return full.legacy_progress_report || (key !== "REPORT_ITEMS" && key !== "DEROGATORY_ITEMS");
}

function parseProgress(data, full) {
	var output = "";
	$.each(data, function (k, v) {
		let key = v.damage_type;
		if (v.damage_type === undefined) {
			key = k;
		}
		var progressTypeClass = `d-flex flex-column progress-type progress-type__${key}`;
		var visibilityClass = progressTypeClass.includes("progress-type__Current")
			? " d-none"
			: "";

		if (isDamageSection(key, full)) {
        output += `<div class="${progressTypeClass}${visibilityClass}">
						 <div class="progress-header">
							 <div class="row m-0">
								 <div class="col-11 p-0">
									 <div class="row m-0">
										 <div class="col-12 col-xl-4 p-0">
											 <span class="progress-header__title first">${v.damage_type}</span>
										 </div>
										 <div class="col-5 col-xl-3 p-0">
											 <span class="progress-header__title">${v.challenged}</span>
										 </div>
										 <div class="col-5 col-xl-3 p-0">
											 <span class="progress-header__title">${v.removed}</span>
										 </div>
										 <div class="col-12 d-none d-xl-flex col-xl-2 p-0">
											 <span class="progress-header__title"></span>
										 </div>
									 </div>
								 </div>
								 <div class="col-1 p-0">
									 <div class="progress-caret d-flex justify-content-end"><div class="caret-down"></div></div>
								 </div>
							 </div>
						 </div>
						 <div class="progress-body">
							 <div class="row progress-body__wrapper my-0">`;
    }

      if(isDamageSection(key, full)){
          $.each(v.list, function (kk, account) {

              var statusClass = account.status == 2 ? "removed" : "";
              var statusText = account.status == 2 ? "Removed" : account.status_text;

              output += `<div class="col-12 col-xl-11 p-0">
							 <div class="row m-0">
								 <div class="col-12 col-xl-4 p-0">
									 <div class="progress-body__item d-flex flex-xl-column">
										 <span class="progress-body__title first">${full.header_creditor}</span>
										 <span class="progress-body__value first">${account.account_name} ${account.account_number}</span>
									 </div>
								 </div>
								 <div class="col-12 col-xl-3 p-0">
									 <div class="progress-body__item d-flex flex-xl-column">
										 <span class="progress-body__title">${full.header_date}</span>
										 <span class="progress-body__value text-capitalize">${account.date}</span>
									 </div>
								 </div>
								 <div class="col-12 col-xl-3 p-0">
									 <div class="progress-body__item d-flex flex-xl-column">
										 <span class="progress-body__title">${full.header_reason}</span>
										 <span class="progress-body__value text-capitalize">${account.reason}</span>
									 </div>
								 </div>
								 <div class="col-12 col-xl-2 p-0">
									 <div class="progress-body__item d-flex flex-xl-column">
										 <span class="progress-body__title">${full.header_status}</span>
										 <span class="progress-body__value text-capitalize ${statusClass}">${statusText}</span>
									 </div>
								 </div>
							 </div>
						 </div>`;
          });
      }


	  if(isDamageSection(key, full)){
		  output += `</div></div></div></div></div>`;
	  }
  });

  return output;
}

function parseReportProgress(data, full) {
	let output = "";
	const derogatoryItems = data?.DEROGATORY_ITEMS ?? [];
	const reportItems = data?.REPORT_ITEMS ?? [];
	const derogatoryIds = new Set(derogatoryItems.map(({ id }) => id));
	const reportItemsPurged = reportItems.filter(
		({ id }) => !derogatoryIds.has(id)
	);
	const chargesToPurge = ["CHARGEOFF_COLLECTION","REPOSSESSION_FORECLOSURE"];
	let purgedData = derogatoryItems;
	$.each(chargesToPurge, function (index, damage) {
		purgedData = purgeDupesChargesByDamage(purgedData, damage);
	});
	const formattedData = groupByAccountWithCounters(purgedData);
	$.each(formattedData, function (k, v) {
		let openingDate = v.opening_date ?? '';
		if(openingDate !== ""){
			const date = new Date(openingDate);
			const formatted = new Intl.DateTimeFormat("en-US", {
				month: "short",
				year: "numeric"
			}).format(date);
			openingDate = "Open on: " +formatted;
		}
		output +=
			`<div class="accordion-item-custom">
                  <div class="accordion-header-custom align-items-center">
                          <div class="col-12 creditor-group-header">
                                  <div class="creditor-group-left">
                                          <div class="icon-chevron chevron" >
                                                  <svg
                                                         viewBox="0 -960 960 960"
                                                         fill="currentColor">
                                                        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                                                  </svg>
                                          </div>
                                          
                                          <span class="creditor-group-name">${v.account_name} - ${v.account_number}</span>
                                  </div>
                                  <div class="creditor-group-stats">
                                       <span class="creditor-stat"><span class="badge bg-secondary me-1 creditor-stat-badge">${parseInt(v.challenged)}</span>Challenged</span>
                       <span class="creditor-stat"><span class="creditor-stat-badge badge bg-success me-1">${parseInt(v.removed)}</span>Deleted</span>
                                  </div>
                          </div>
                  </div>
                  <div class="accordion-content-custom">
                        <div class="creditor-group-items creditor-group-open">
                <div class="creditor-item-row">
                        <div>${openingDate}</div>
                </div>
                <div class="creditor-item-header">
                    <div>
                        <div>Type</div>
                        <div>Date</div>
                        <div>Balance</div>
                        <div>Status</div>
                    </div>
                </div>`;
		$.each(v.damages, function (kk,dmg_info){
			let acctStatus = dmg_info.removed === true ? "Deleted" : "Under Investigation";
			let badgeStatus = acctStatus && acctStatus.toLowerCase() === 'deleted' ? 'bg-success' : 'bg-secondary';
			const damageLabels = {
				"30_DAYS_LATE":             "30 Days Late",
				"60_DAYS_LATE":             "60 Days Late",
				"90_DAYS_LATE":             "90 Days Late",
				"120_DAYS_LATE":            "120+ Days Late",
				"150_DAYS_LATE":            "150+ Days Late",
				"180_DAYS_LATE":            "180+ Days Late",
				"CHARGEOFF_COLLECTION":     "Charge Off / Collection",
				"REPOSSESSION_FORECLOSURE": "Repossession / Foreclosure",
			};
			let damage = damageLabels[dmg_info.damage] ?? dmg_info.damage.replaceAll("_"," ");
			let damageDate ="-";
			if(dmg_info.damage_date){
				const dateString = dmg_info.damage_date;
				const [year, month, day] = dateString.split("-").map(Number);
				const dateObject = new Date(year, month - 1, day);
				damageDate = "Damage Date: "+ new Intl.DateTimeFormat("en-US", {
					month: "short",
					year: "numeric"
				}).format(dateObject);
			}
			const balance = (dmg_info.balance !== null && dmg_info.balance !== undefined)
				? '$' + Number(dmg_info.balance).toLocaleString()
				: '-';
			output += `<div class="creditor-item-row">
                            <div>
                                    <div class="creditor-item-detail"><span class="fw-bold">${damage}</span></div>
                                    <div>${damageDate}</div>
                                    <div>${balance}</div>
                                    <div><span class="creditor-item-result"><span class="badge ${badgeStatus}"
                                                                         style="font-size:0.75rem;cursor:help;"
                                                                         data-bs-toggle="tooltip"
                                                                         data-bs-original-title="${acctStatus === 'Deleted' ? 'This item was successfully removed from your report. It no longer affects your score.' : 'This item is currently under investigation with the credit bureau.'}">${acctStatus}</span></span></div>
                            </div>
                        </div>`;
		});
		output+=`</div>
                  </div>
          </div>`;
	});
	let otherItems = reportItemsPurged.filter((item)=> item.disputed_at == null);
	if(otherItems !== undefined && otherItems.length > 0 ){
		/** Adding the other report items section */
		output += `<div class="report-sections__title">
                <i class="bi bi-exclamation-circle me-1"></i>Other Negative Items <i
                    class="bi bi-question-circle info-tooltip" data-bs-toggle="tooltip"
                    aria-label="Items on your report that are hurting your score but aren't currently being disputed."
                    data-bs-original-title="Items on your report that are hurting your score but aren't currently being disputed."></i>
            </div>
            <div class="table-responsive">
                <table class="table align-middle neg-items-table">
                    <thead>
                    <tr>
                        <th>Account</th>
                            <th>Account Number</th>
                            <th>Damage</th>
                        <th>Date</th>
                        <th>Balance</th>
                    </tr>
                    </thead>
                    <tbody>`;
		/** Sorting the elements, high risk first */
		const sortedItems = Object.values(otherItems).sort((a, b) => {
			const balanceA = a.current_balance ?? 0;
			const balanceB = b.current_balance ?? 0;
			if (balanceA === 0 && balanceB !== 0) return 1;
			if (balanceB === 0 && balanceA !== 0) return -1;
			return balanceB - balanceA;
		});
		$.each(sortedItems, function (index, account) {
			let balance = account.current_balance ?? 0;
			let severity = balance === 0 ? 'severity-low' : 'severity-high';
			let focusBalance = balance === 0 ? '' : 'fw-bold';
			let damage ="-";
			let damageDate ="-";
			if(account.damage_status){
				damage = account.damage_status;
				const dateString = account.damage_date;
				const dateObject = new Date(dateString);
				damageDate = dateObject.toLocaleDateString();
			}
			output += `
        <tr class="${severity}">
            <td class="fw-bold">${account.account_name}</td>
            <td class="fw-bold">${account.account_number}</td>
            <td class="fw-bold">${damage}</td>
            <td>${damageDate}</td>            
            <td class="${focusBalance}">$${balance.toLocaleString()}</td>
        </tr>
    `;
		});
		output += `    </tbody>
                </table>
            </div>`;
	}
	return output;
}
const normalizeAccountNumber = (value) => {
	if (!value || typeof value !== 'string') return '';
	return value.replace(/[Xx]+/g, '').replace(/[^a-z0-9]/gi, '').toUpperCase();
};
const isHexHash = (value) => {
	if (!value || typeof value !== "string") return false;
	const v = value.trim();
	if (v.toUpperCase() === "NULL") return false;
	if (!/^[a-f0-9]+$/i.test(v)) return false;
	return [32, 40, 64].includes(v.length);
};
const damageDedupKey = (item) => {
	if (isHexHash(item.array_hash_complex)) {
		return item.array_hash_complex;
	}
	const norm = normalizeAccountNumber(item.account_number);
	const name = (item.account_name ?? '').trim().toUpperCase().slice(0, 21);
	if (!norm && !name) {
		// Avoid collapsing unrelated tradelines that share empty hash, account number, and name.
		return `id:${item.damage_id ?? item.id}`;
	}
	return `${item.bureau}_${norm}_${name}`;
};
function purgeDupesChargesByDamage(data,damage_type) {
	const newest = {};
	if(damage_type === undefined){
		return data;
	}
	for (const item of data) {
		if (item.damage !== damage_type) continue;
		const key = damageDedupKey(item);
		const existingDate = newest[key]?.damage_date ? new Date(newest[key].damage_date) : new Date(0);
		const candidateDate = item.damage_date ? new Date(item.damage_date) : new Date(0);
		if (!newest[key] || candidateDate > existingDate) {
			newest[key] = item;
		}
	}
	return data.filter(item => {
		if (item.damage !== damage_type) return true;
		const key = damageDedupKey(item);
		return newest[key] === item;
	});
}
function groupByAccountWithCounters(items) {
	const grouped = Object.values(
		items.reduce((acc, item) => {
			const key = damageDedupKey(item);
			const isChargeOffOrRepo = item.damage === 'CHARGEOFF_COLLECTION' || item.damage === 'REPOSSESSION_FORECLOSURE';
			const isItemDeleted = isChargeOffOrRepo
				? item.removed === 1
				: (item.removed === 1 || item.damage_removed === 1);
			let targetKey = key;

			if (acc[targetKey] && acc[targetKey].id !== item.id) {
				// Two different DB rows share the same dedup key (duplicate tradeline).
				// Prefer the newer record (higher id) as the group anchor.
				if (item.id > acc[targetKey].id) {
					const existingDamages = acc[targetKey].damages;
					const existingChallenged = acc[targetKey].challenged;
					const existingRemoved = acc[targetKey].removed;
					acc[targetKey] = {
						...item,
						challenged: existingChallenged,
						removed: existingRemoved,
						damages: existingDamages,
					};
				}
				// Keep targetKey unchanged so the duplicate's damages merge in below.
			}

			if (!acc[targetKey]) {
				acc[targetKey] = {
					id: item.id,
					account_number: item.account_number,
					account_name: item.account_name,
					opening_date: item.opening_date,
					challenged: 0,
					removed: 0,
					damages: []
				};
			}
			const existingIdx = acc[targetKey].damages.findIndex(
				d => d.damage === item.damage &&
					(d.damage_date === item.damage_date || !d.damage_date || !item.damage_date)
			);
			if (existingIdx === -1) {
				if (isItemDeleted) {
					acc[targetKey].removed += 1;
				}
				if (item.disputed_at !== null && item.removed === 0 && item.damage_removed === 0) {
					acc[targetKey].challenged += 1;
				}
				acc[targetKey].damages.push({
					id: item.array_hash_complex,
					damage: item.damage,
					removed: isItemDeleted,
					damage_date: item.damage_date,
					account_removed: item.removed === 1,
					was_challenged: item.disputed_at !== null && item.removed === 0 && item.damage_removed === 0,
					reason: item.reason ?? null,
					balance: item.opening_balance ?? item.current_balance ?? null
				});
			} else if (acc[targetKey].damages[existingIdx].account_removed && item.removed === 0) {
				// Replace entry from superseded account with one from active account and fix counters
				if (acc[targetKey].damages[existingIdx].removed) {
					acc[targetKey].removed -= 1;
				}
				if (isItemDeleted) {
					acc[targetKey].removed += 1;
				}
				if (acc[targetKey].damages[existingIdx].was_challenged) {
					acc[targetKey].challenged -= 1;
				}
				const newWasChallenged = item.disputed_at !== null && item.removed === 0 && item.damage_removed === 0;
				if (newWasChallenged) {
					acc[targetKey].challenged += 1;
				}
				acc[targetKey].damages[existingIdx] = {
					id: item.array_hash_complex,
					damage: item.damage,
					removed: isItemDeleted,
					damage_date: item.damage_date,
					account_removed: false,
					was_challenged: newWasChallenged,
					reason: item.reason ?? null,
					balance: item.opening_balance ?? item.current_balance ?? null
				};
				// Update group metadata from the active account
				acc[targetKey].account_number = item.account_number;
				acc[targetKey].account_name = item.account_name;
				acc[targetKey].opening_date = item.opening_date;
			}
			return acc;
		}, {})
	);
	const damagePriority = {
		"30_DAYS_LATE": 1,
		"60_DAYS_LATE": 2,
		"90_DAYS_LATE": 3,
		"120_DAYS_LATE": 4,
		"REPOSSESSION_FORECLOSURE": 98,
		"CHARGEOFF_COLLECTION": 99
	};
	grouped.forEach(account => {
		account.damages.sort((a, b) => {
			const priorityA = damagePriority[a.damage] ?? 50;
			const priorityB = damagePriority[b.damage] ?? 50;
			if (priorityA !== priorityB) {
				return priorityA - priorityB;
			}
			return (b.damage_date ?? '').localeCompare(a.damage_date ?? '');
		});
	});
	return grouped;
}

// The "as of" date and stale-report warning, shared by both the legacy and rich render paths
// so the rich path (ENG-5559) doesn't silently drop what parseSummaryProgress() already shows.
function renderSummaryMeta(data) {
    const meta = data && data.SUMMARY_META;
    let output = "";
    if (meta && meta.as_of_text) {
        output += `<div class="progress-summary__meta text-muted small pb-2">${meta.as_of_text}</div>`;
        if (meta.stale_text) {
            output += `<div class="progress-summary__stale alert alert-warning py-2 small mb-3">${meta.stale_text}</div>`;
        }
    }
    return output;
}

function parseSummaryProgress(data, full) {
    let output = "";
	if(data.SUMMARY === undefined || data.SUMMARY === ""){
		output = "No report yet, come back soon.";
	}
    output += renderSummaryMeta(data);
    $.each(data, function (k, v) {
        let key = v.damage_type;
        if(v.damage_type === undefined){
            key = k;
        }
        if(key === "SUMMARY"){
            output += `<div class="progress-body">`;
            $.each(v, function (header, body) {

                let bodyHtml = '';

                $.each(body, function (i, item) {
                    bodyHtml += `<div class="progress-body__markdown_value first">${item}</div>`;
                });

                output += `<div class="col-12 pb-3">
                            <div class="row m-0">
                                <div class="col-12 p-0">
                                    <div class="">
                                        <span class="progress-summary-key-title">${header}</span>
                                        <div class="">${bodyHtml}</div>
                                    </div> 
                                </div>
                            </div>
                           </div>`;
            });
            output += `</div>`;
        }
	});

    return output;
}

// ENG-5559: flag-gated rich summary. Rich when the flag is on AND a structure is present for
// this bureau; otherwise falls back to today's parseSummaryProgress() byte-for-byte. The rich
// path still renders the "as of" / stale-report meta block — parseSummaryProgress() renders it
// internally, but parseRichSummary() only knows about summary_rich, not SUMMARY_META.
function renderBureauSummary(bureau, data, full) {
	if (full && full.rich_progress_summary && full.summary_rich && full.summary_rich[bureau]) {
		return renderSummaryMeta(data) + parseRichSummary(full.summary_rich[bureau]);
	}
	return parseSummaryProgress(data, full);
}

// Finds the span the model bolded, not just the first substring. Highlights arrive in document
// order, so the search starts where the previous match ended, and a match counts only when it is
// not glued to another letter or digit (so a highlight of "29" never lands inside "629").
// Falls back to the plain first match when no bounded one exists, and -1 when none exists at all.
function findHighlight(haystack, needle, from) {
	let idx = haystack.indexOf(needle, from);
	while (idx !== -1) {
		let before = idx === 0 ? '' : haystack.charAt(idx - 1);
		let after = haystack.charAt(idx + needle.length);
		if (!/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after)) {
			return idx;
		}
		idx = haystack.indexOf(needle, idx + 1);
	}
	return haystack.indexOf(needle, from);
}

// Renders {sections: [{heading, items: [{text, highlights}]}]}. Text is escaped via jQuery's
// text()/html() round-trip before any markup is added, so a seeded <script> bullet renders as
// text, not a tag. Each highlight is wrapped in <strong> at the span findHighlight() picks; a
// highlight repeated in the same bullet is bolded once (the server de-duplicates them).
function parseRichSummary(structure) {
	let output = "";
	$.each((structure && structure.sections) || [], function (i, section) {
		let escapedHeading = $('<div>').text(section.heading || '').html();
		let bodyHtml = '';
		$.each(section.items || [], function (j, item) {
			let escaped = $('<div>').text(item.text || '').html();
			let cursor = 0;
			$.each(item.highlights || [], function (k, highlight) {
				let escapedHighlight = $('<div>').text(highlight).html();
				if (escapedHighlight === '') {
					return;
				}
				let idx = findHighlight(escaped, escapedHighlight, cursor);
				if (idx === -1) {
					return;
				}
				let wrapped = '<strong>' + escapedHighlight + '</strong>';
				escaped = escaped.slice(0, idx) + wrapped + escaped.slice(idx + escapedHighlight.length);
				cursor = idx + wrapped.length;
			});
			bodyHtml += `<div class="progress-body__markdown_value first">${escaped}</div>`;
		});

		output += `<div class="col-12 pb-3">
                    <div class="row m-0">
                        <div class="col-12 p-0">
                            <div class="">
                                <span class="progress-summary-key-title">${escapedHeading}</span>
                                <div class="">${bodyHtml}</div>
                            </div>
                        </div>
                    </div>
                   </div>`;
	});

	return `<div class="progress-body">${output}</div>`;
}

function loadConcierge(read, prepend){
	window.clearTimeout(window.chatLoad);
	
	$('#chat-reply-form').prop('disabled', '');
	$('#chat-reply-submit').prop('disabled', '');

  var url = $('#chat-url').attr('data-load');
  if (!url || typeof url != 'string') {
    return
  }
	
	$.ajax({
		url: url,
		data: {
			_token: window.Laravel.csrfToken,
			msgCount: $('#chat-wrap').attr('data-msg'),
			append: $('#chat-wrap').attr('data-append'),
			prepend: prepend,
			open: $('#chat-wrap').attr('data-open'),
			read: read
		},
		type: 'POST',
		dataType: 'json',
		cache: false,
		success: function (data) {
			if (data.success) {
				if(prepend){
					$('#show-more').remove();
				}

				if(data.newMessage > 0){
					$('#chat-notice').html(data.newMessage);
					$('#chat-notice').css('display', 'block');
				} else {
					$('#chat-notice').css('display', 'none');
				}

				outputMessages(data);
				$('#chat-wrap').attr('data-append', 1);
				window.chatLoad = window.setTimeout('loadConcierge()', 5000);
			}
		}
	});
}

function outputMessages(data){
	
	var msgs = '';
	$.each(data.messages, function (k, message) {
		if(!$('#message'+message.id).length){
			var avatar = '';
			var initials = '';
			var advocate = '';

			if(message.user_avatar){
				avatar = ' style="background-image: url('+message.user_avatar+')"';

			}
			if(message.initials){
				initials = message.initials;
			}
			if(message.advocate){
				advocate = ' advocate-message';
			}
			if(message.minimize){
				msgs = msgs+'<div class="chat-message minimal'+advocate+'" id="message'+message.id+'"><div class="chat-message-text">'+message.message+'</div></div>';
			}else{
				msgs = msgs+'<div class="chat-message'+advocate+'" id="message'+message.id+'"><div class="chat-thread-avatar"'+avatar+'>'+initials+'</div><span class="chat-name">'+message.display_name+'</span> <span class="chat-time">'+message.created_at_text+'</span><div class="chat-message-text"><div class="chat-message-graphic">&nbsp;</div>'+message.message+'</div></div>';
			}
		}
	});
	if(data.prepend){
		$('#chat-wrap').prepend(msgs);
	}else if(data.append){
		$('#chat-wrap').append(msgs);

		if(msgs != ''){
			//scroll to bottom
			$("#chat-wrap").animate({ scrollTop: $('#chat-wrap').prop("scrollHeight")}, 300);
		}
	}else{
		$('#chat-wrap').html(msgs);
		if(msgs != ''){
			//scroll to bottom
			$("#chat-wrap").animate({ scrollTop: $('#chat-wrap').prop("scrollHeight")}, 300);
		}
		
	}
	if(data.show_more && !$('#show-more').length){
		$('#chat-wrap').prepend('<a id="show-more" href="javascript:;">Load Older Messages</a>');
	}
	$('#show-more').unbind();
	$('#show-more').click(function(){
		var count = parseInt($('#chat-wrap').attr('data-msg')) + 10;
		$('#chat-wrap').attr('data-msg', count);
		$(this).html('<img src="/img/portal-loader.gif" />');
		
		loadConcierge(null, 1);
	});

}

$(document).ready(function () {
	if($('.check-creditsquad-status').length > 0) {
		var url = $('.check-creditsquad-status').attr('data-url') ?? null;

		// Defensive validation: ensure URL exists and is valid
		if (typeof url !== 'string' || url.trim() === '') {
			console.error('Invalid or missing data-url attribute on .check-creditsquad-status element');
			return;
		}

        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: {
                _token: window.Laravel.csrfToken
            },
            success: function (data) {

            	if(typeof data.status != 'undefined' && true == data.status && !$('.check-creditsquad-status').hasClass('no-reload')) {
                    window.location.reload();
				}
            },

            error: function (xhr, status, thrownError) {

                alertify.alert('An unexpected error occurred.', xhr.status + " " + thrownError);

            }
        });
    }
	TrustevV2.Init($('#trustev').val(), function(sessionId) {
		$('#trustev_session').val(sessionId);
	}, true);
});

function LoadingScreenManager(formElId) {
    this.formElId = formElId;
    this.loadingScreenElId = 'portal_loading_screen';
    this.showAfterMilliseconds = 1500;

    this.initialize = function() {
        $('#'+this.formElId).on('submit', function() {
            setTimeout(function() {
                $('#'+this.loadingScreenElId).show();
            }.bind(this), this.showAfterMilliseconds);
        }.bind(this));

        $(window).on('unload', function() {
            $('#'+this.loadingScreenElId).hide();
        }.bind(this));
    };

    this.initialize();
}

if($('#autoregister_squad').length) {
	$('#autoregister_squad').on('click', function () {
		var url = $(this).data('url') ?? '';

		// Defensive validation: ensure URL exists and is valid
		if (typeof url !== 'string' || url.trim() === '') {
			console.error('Invalid or missing data-url attribute on #autoregister_squad button');
			return false;
		}

		$.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: {
                _token: window.Laravel.csrfToken
            },
            success: function (data) {
				
				if(typeof data.message != "undefined"  && typeof data.error != "undefined" && data.error == true) {
					alertify.alert('Error', data.message);
				} else if(typeof data.errors != "undefined") {
					alertify.alert('Error', data.errors);
				} else if(typeof data.success != "undefined" && typeof data.response != "undefined") {
					alertify.alert(data.response);
					location.reload();
				} else if(typeof data.verification != "undefined") {
					var HTML = '<input type="hidden" name="application_challenge_id" value="'+data.verification.challenge_id+'">';					
					data.verification.questions.forEach(function(question) {
						
						HTML += '<div class="card-block"><h5>'+ question.Question +'</h5>';
							question.AnswerOption.forEach(function(answer) {
								HTML += '<input type="radio" name="verification_answers['+ question.QuestionNumber +']]" id="verification-'+ question.QuestionNumber +'-'+ answer.AnswerNumber +'" value="'+ answer.AnswerNumber +'"><label for="verification-'+ question.QuestionNumber +'-'+ answer.AnswerNumber +'">'+ answer.Answer +'</label><br />';
							});
						HTML += '</div>';
					});
					
					$('#squadValidation .modal-body').html(HTML);
					$('#squadValidation').modal('show');
				}
            },
            error: function (xhr, status, thrownError) {
                alertify.alert('An unexpected error occurred.', xhr.status + " " + thrownError);
            }
        });
		
		return false;
	});
	
	$('#squadValidation form').on('submit', function () {
		$.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            dataType: 'json',
            data: {
                _token: window.Laravel.csrfToken,
				form: $(this).serialize()
            },
            success: function (data) {
				
				if(typeof data.success != "undefined" && data.success == true) {
					location.reload();
				} else if(typeof data.errors != "undefined") {
					$('#squadValidation').modal('hide');
					alertify.alert('Error', data.errors);
				}
            },
            error: function (xhr, status, thrownError) {
                alertify.alert('An unexpected error occurred.', xhr.status + " " + thrownError);
            }
        });
		return false;
	});
}

$('form.document-confirmation-form').on("submit", function (){
	$(this).find('button[type=submit]').prop("disabled", true);
});

const progressEl = document.getElementById('progress');
if (progressEl) {
	progressEl.addEventListener('click', function (e) {
		const header = e.target.closest('.accordion-header-custom');
		if (!header) return;
		const item = header.parentElement;
		const content = item.querySelector('.accordion-content-custom');
		const chevron = item.querySelector('.chevron');
		const isOpen = item.classList.contains('active');
		document.querySelectorAll('.accordion-item-custom').forEach(i => {
			i.classList.remove('active');
			i.querySelector('.accordion-content-custom').style.maxHeight = null;
			i.querySelector('.chevron').classList.remove('rotate');
		});
		if (!isOpen) {
			item.classList.add('active');
			content.style.maxHeight = content.scrollHeight + "px";
			chevron.classList.add('rotate');
		}
	});
}