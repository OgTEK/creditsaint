jQuery(function ($) {
    var $form = $('#gs-form');

    $('#f_phone').mask('+1(000)000-0000', {placeholder: "+1(___)___-____"});
    $('#f_social_number').mask('000-00-0000', {placeholder: "___-__-____"});
	$('#f_spouse_social_number').mask('000-00-0000', {placeholder: "___-__-____"});
    $('#f_zip,#billing_zip').mask('00000', {placeholder: "_____"});
    $('#f_card_number').mask('0000-0000-0000-0000', {placeholder: "____-____-____-____"});
    $('#f_card_code').mask('0000', {placeholder: "___"});

    $('#f_birth_date').mask('00/00/0000', {placeholder: "MM/DD/YYYY"});
    $('#f_spouse_birth_date').mask('00/00/0000', {placeholder: "MM/DD/YYYY"});
    
	
	   
	$('.program').each(function(){
		updatePrice();
		$(this).click(function(){
			$('input[name="program_id"]').val($(this).attr('data-program'));
			$('.program').removeClass('chosen');
			$(this).addClass('chosen');
			updatePrice();

        	$('#gs-send').show();

        	$('#gs-programs-details').hide();
        	$('#gs-programs-details').fadeIn();
		});
	});
	
	updatePrice();
	
	$form.find('#spouse-program .custom-radio .custom-control-input[name="spouse_program_id"]').on('click', function () {
	     updatePrice();
	
	});
	$form.find('.squad-program-table .custom-radio .custom-control-input[name="program_id"]').on('click', function () {
        updateSquadPrice();

        $('html, body').animate({
            scrollTop: ($("#gs-programs-details").offset().top - 600)
        }, 1000);
    });
	$form.find('.squad-program-table .custom-radio .custom-control-input[name="spouse_program_id"]').on('click', function () {
	     updateSquadPrice();
	
	});

    $('#gs-send').on('click', function () {
        $('input[name="submit_noconsent"]').val('');
		submitGSForm();
    });
	$('#gs-send-noconsent').click(function(){
		$('input[name="submit_noconsent"]').val('1');
		submitGSForm();
	});
	
	$('#f_billing_address').keyup(function(){
		$('#address_validate').val('0');
	});
	$('#f_billing_city').keyup(function(){
		$('#address_validate').val('0');
	});
	$('#f_billing_state').change(function(){
		$('#address_validate').val('0');
	});
	$('#f_billing_zip').keyup(function(){
		$('#address_validate').val('0');
	});
	
	$('#program_id').each(function(){
		if($(this).attr('data-single') == '1'){
			updatePrice();
			
			$('#gs-send').show();
		}
	});
	$('#spouse-checkbox').click(function(){
		$(this).toggleClass('selected');
		if($(this).hasClass('selected')){
			$('#add-spouse-input').val('1');
		}else{
			$('#add-spouse-input').val('');
		}
	});
	$('#spouse_added').each(function(){
		$('#spouse-program').slideToggle();
		
		$('input[name="program_id"]').each(function(){
			updatePrice();
		});
	});
	$('#squad-checkbox').click(function(){
		$(this).toggleClass('selected');
		if ($(this).hasClass('selected')){
			$('#squad_program_id').val('2');
		}else{
			$('#squad_program_id').val('');
		}
		updateSquadPrice();
	});
	$('#squad-spouse-checkbox').click(function(){
		$(this).toggleClass('selected');
		if ($(this).hasClass('selected')){
			$('#spouse_squad_program_id').val('2');
		}else{
			$('#spouse_squad_program_id').val('');
		}
		updateSquadPrice();
	});
	$('#change-billing-addr').click(function(){
		$('#edit-billing-addr').removeClass('hidden');
		$('#billing-addr-noedit').addClass('hidden');
	});
	$('#agreement-list .agreement-require,#f_ssn_approve').each( function () {
	        
		if ($('#agreement-list .agreement-require,#f_ssn_approve').not(':checked').length){
			$('#gs-send').prop('disabled', true);
			$('.step5-require').removeClass('hidden');
		}else{
			$('#gs-send').prop('disabled', null);
			$('.step5-require').addClass('hidden');
		}
				       
	});	

    $('#agreement-list .agreement-require,#f_ssn_approve').on('click', function () {
        
		if ($('#agreement-list .agreement-require,#f_ssn_approve').not(':checked').length){
			$('#gs-send').prop('disabled', true);
			$('.step5-require').removeClass('hidden');
		}else{
			$('#gs-send').prop('disabled', null);
			$('.step5-require').addClass('hidden');
		}
		

        $(this).blur();
    });
	$('#checkall').on('click', function () {
        $('.agreement-require').each(function(){
			$(this).prop('checked', 'checked');
		});
		if ($('#agreement-list .agreement-require,#f_ssn_approve').not(':checked').length){
			$('#gs-send').prop('disabled', true);
			$('.step5-require').removeClass('hidden');
		}else{
			$('#gs-send').prop('disabled', null);
			$('.step5-require').addClass('hidden');
		}
		

        $(this).blur();
    });

    setInterval(function () {
        $.get('/updateSession.json');
    }, 30 * 1000);


    $('#spouse_same_address,#billing_same_address').on('click', function () {
        if ($(this).is(':checked')) {
            $.each($form.find('input.base-value,select.base-value'), function () {
                $(this).val($(this).attr('data-base-value'));
            });
			$('#gs-send').prop('disabled', '');
			
        } else {
            $.each($form.find('input.base-value,select.base-value'), function () {
                $(this).val('');
            });
        }

        $(this).blur();
    });
	$('#showcoupon').click(function(){
		$('#coupon-box').slideToggle();
	});
    $('#button_check_coupon').on('click', function () {
        var $field = $('#f_coupon');
        var this_ = this;

        if ($field.val()) {
            $.ajax({
                url: $(this_).attr('data-checkCoupon'),
                data: {code: $field.val(), program_id: $('input[name="program_id"]').val(), _token: window.Laravel.csrfToken},
                type: 'POST',
                dataType: 'json',
                success: function (data) {
                    if (data.success) {
                        $field.closest('.form-group').first().addClass('has-success');
                        $field.addClass('form-control-success');
                        $field.prop('readonly', 'readonly');
						$('#total_initial').html(data.coupon.initial_fee);
						$('#total_monthly').html(data.coupon.monthly_fee);
						if(data.coupon.free_months){
							$('#total_monthly').prepend('<sup>First '+data.coupon.free_months+' Months Free, then: <br /></sup');
							$('input[name="card_number"]').prop('required', '');
							$('select[name="card_date_month"]').prop('required', '');
							$('select[name="card_date_year"]').prop('required', '');
							$('input[name="card_code"]').prop('required', '');
						}
                        $(this_).fadeOut(function () {
                            $(this).remove();
                        });
                    } else {
                        alert('Incorrect Code or invalid Coupon');
                    }
                }
            });
        }
    });

    switch ($form.attr('data-step')) {
        case '1':
            $('#gs-send').removeClass('hidden');
            break;
        case '2':
			$('#gs-send').removeClass('hidden');
            break;
		case '3':
			$('#gs-send').removeClass('hidden').prop('disabled', 'disabled');    
			break;
        case '4':
            $('#gs-send').removeClass('hidden');
            break;
        case '5':
           if ($('#agreement-list .agreement-require,#f_ssn_approve').not(':checked').length){
				$('#gs-send').removeClass('hidden').prop('disabled', 'disabled');
			}else{
				$('#gs-send').removeClass('hidden').prop('disabled', null);
			}
		  
			break;
        case '6':
            break;
		case '7':
		    
			break;
    }
	var alt = 1;
	$('.agreement-item').each(function(){
		if (alt == 1){
			$(this).addClass('alt');
			alt = 0;
		}else{
			alt = 1;
		}
		var _this = this;
		$(this).find('.agreement-item-header').each(function(){
			var h = this;
			$(this).find('.agreement-caret,span').click(function(){
				if ($(_this).hasClass('open')){
					$(_this).removeClass('open');
					$(_this).find('.agreement-body').slideUp();
					$(h).find('.agreement-caret .fas').removeClass('fa-caret-up').addClass('fa-caret-down');
				}else{
					$('.agreement-body').slideUp();
					$(_this).addClass('open');
					$(_this).find('.agreement-body').slideDown();
					$(h).find('.agreement-caret .fas').removeClass('fa-caret-down').addClass('fa-caret-up');
				}
			});
		});
		
	});
	$('.program-item').each(function(){
		
		var _this = this;
		$(this).find('.program-item-header').each(function(){
			var h = this;
			$(this).click(function(){
				if ($(_this).hasClass('open')){
					$(_this).removeClass('open');
					$(_this).find('.program-body').slideUp();
					$(h).find('.program-caret .fas').removeClass('fa-caret-up').addClass('fa-caret-down');
				}else{
					$('.program-body').slideUp();
					$(_this).addClass('open');
					$(_this).find('.program-body').slideDown();
					$(h).find('.program-caret .fas').removeClass('fa-caret-down').addClass('fa-caret-up');
				}
			});
		});
		
	});
	
	$('#squad_no').click(function(){
		$('#gs-form').submit();
	});
	$('#squad_yes').click(function(){
		$('input[name="squad_upgrade"]').val('yes');
		if($('#squad-spouse-checkbox').hasClass('selected')){
			$('input[name="spouse_squad_upgrade"]').val('yes');
		}
		$('#gs-form').submit();
	});
	$('#consultation_no').click(function(){
		$('#gs-form').submit();
	});
	$('#consultation_yes').click(function(){
		$('input[name="consultation"]').val('yes');
		$('#gs-form').submit();
	});

	// Native form.submit(): disableSubmitButton.js preventDefault()s submits while a disabled
	// .btn-consent is present. The bypass also skips its double-submit guard, so this control
	// carries its own.
	$('#skip-family-member-btn').click(function(e){
		e.preventDefault();

		if (this.dataset.submitting) {
			return;
		}
		this.dataset.submitting = '1';
		$(this).css('pointer-events', 'none');

		$('#skip-family-member-input').val('1');
		document.getElementById('gs-form').submit();
	});

	// Safari/Firefox restore from the back-forward cache with the guard still set and the skip
	// flag at 1; without this reset, Back leaves the Skip link dead and Continue skips the form.
	window.addEventListener('pageshow', function(){
		var skipBtn = document.getElementById('skip-family-member-btn');
		if (skipBtn) {
			delete skipBtn.dataset.submitting;
			skipBtn.style.pointerEvents = '';
		}

		var skipInput = document.getElementById('skip-family-member-input');
		if (skipInput) {
			skipInput.value = '0';
		}
	});

});
function submitGSForm(){
	var $form = $('#gs-form');
	var $btn = $('#gs-send');
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
                case 'spouse_username':
                    if (/^([a-zA-Z0-9_\@.!-]){4,}$/.test($(this).val())) {
                        if ($form.find('input[name="username"]').val() != $(this).val()) {
                            check = true;
                        } else {
                            alert('User ID and Spouse’s User ID must be different');
                        }
                    }
                    break;
                case 'username':
                    if (/^([a-zA-Z0-9_\@.!-]){4,}$/.test($(this).val())) {
                        check = true;
                    }
                    break;
                case 'address':
                case 'billing_address':
                case 'address_apt':
                case 'billing_city':
                case 'city':
                    if (/^([a-zA-Z0-9_.,:+-\/\\ ]){2,}$/.test($(this).val())) {
                        check = true;
                    }
                    break;
                case 'social_number':
				case 'spouse_social_number':
                    if (/^([0-9]){3}\-([0-9]){2}\-([0-9]){4}$/.test($(this).val())) {
                        check = true;
                    }
                    break;
                case 'zip':
                case 'billing_zip':
                    if (/^([0-9]){5}$/.test($(this).val())) {
                        check = true;
                    }
                    break;
                case 'first_name':
                case 'last_name':
                    if (/^([a-zA-Z0-9., -]){2,}$/.test($(this).val())) {
                        check = true;
                    }
                    break;
                case 'email':
                    if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,8})+$/.test($(this).val())) {
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
            scrollTop: $firstErrorField.offset().top - 120
        }, 300);

        return false;
    } else {
        //check for spouse single program
		$('input[name="spouse_program_id"]').each(function(){
			if(!$('#spouse_added').length){
				$(this).remove();
			}
		});
		$btn.text('Please wait...').attr('disabled', 'disabled');

        $form.submit();
    }
}
function updatePrice(){
	$('#gs-programs-details').removeClass('hidden');
	var initial_fee = 0;
	var monthly_fee = 0;
	var single = true;
	var chosen = $('input[name="program_id"]').val();
	$('.program').each(function(){
		single = false;
		if ($(this).attr('data-program') == chosen){
			initial_fee = $(this).attr('data-initial-fee');
			monthly_fee = $(this).attr('data-monthly-fee');
		}
	});
	
	$('#spouse-program .custom-control-input').each(function(){
		
		if ($(this).prop('checked') == true){
			
			monthly_fee = (parseFloat(monthly_fee) + parseFloat($(this).attr('data-monthly-fee'))).toFixed(2);
			if(parseFloat($(this).attr('data-initial-fee')) > parseFloat(initial_fee)){
				initial_fee = $(this).attr('data-initial-fee');
			}
		}
	});
	if(single == true){
		$('input[name="program_id"]').each(function(){
			//do this instead if only 1 program available
			initial_fee = $(this).attr('data-initial-fee');
			monthly_fee = $(this).attr('data-monthly-fee');
			
			if($('#spouse_added').length){
				monthly_fee = (parseFloat(monthly_fee) + parseFloat($('input[name="spouse_program_id"]').attr('data-monthly-fee'))).toFixed(2);
				if(parseFloat($('input[name="spouse_program_id"]').attr('data-initial-fee')) > parseFloat(initial_fee)){
					initial_fee = $('input[name="spouse_program_id"]').attr('data-initial-fee');
				}
			}
		});
	}
	$('#total_initial').html('$'+initial_fee);
	$('#total_monthly').html('$'+monthly_fee);
}
