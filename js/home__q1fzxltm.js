

jQuery(function ($) {
	var width = $( window ).width();
	/*
	$('.slideout').each(function(){
		if (width > 1000){
			
			$(this).find('.background-slide .bg').css('width', width +'px');
			$(this).find('.background-slide .border').each(function(){
				$(this).css('width', $(this).width() +'px');
			});
			
		}
	});*/
	
	document.navBtn = 0;
	$("#navbtn").click(function() {
		if (document.navBtn == 0){
			
			document.getElementById('navbtn').className = 'navbutton sel';
			
			$('nav').slideDown(300);
			document.navBtn = 1;
		}else{
			
			document.getElementById('navbtn').className = 'navbutton';
			
			$('nav').slideUp(300);
			document.navBtn = 0;
		}
	});
	var alt = 0;
	$('.faq-item').each(function(){
		if (alt == 1){
			$(this).addClass('alt');
			alt = 0;
		}else{
			alt = 1;
		}
		$(this).click(function(){
			if ($(this).hasClass('open')){
				$(this).removeClass('open');
				$(this).find('.faq-body').slideUp();
				$(this).find('.faq-header .faq-caret .fas').removeClass('fa-caret-up').addClass('fa-caret-down');
			}else{
				$(this).addClass('open');
				$(this).find('.faq-body').slideDown();
				$(this).find('.faq-header .faq-caret .fas').removeClass('fa-caret-down').addClass('fa-caret-up');
			}
		});
	});
	
	
	document.isMobile = 0;
	resize();
	$(window).resize(function(){
		resize();
	});
	
	$(window).scroll(function(){
		if (document.documentElement.scrollTop){ //if IE
			var ie = 1;
			var curscroll = document.documentElement.scrollTop;
		}else{
			
			var ie = 0;
			var curscroll = document.body.scrollTop;
		}
		
		if (document.isMobile == 0){
			if (curscroll == 0){
				$('header').removeClass('scroll');
			}else{
				$('header').addClass('scroll');
			}
			
			$('.home-section').each(function(){
				var off = $(this).offset();
				var h = $(window).height();
				var o = (off.top - h);
				//console.log('object offset: '+o+' current scroll: '+curscroll);
				if (curscroll > o){
					if ($(this).hasClass('worryfree')){
						$(this).css('background-position', '50% '+(100 - ((curscroll - o - 150) * 0.1)).toFixed(2)+'%');	
					}else if ($(this).hasClass('left')){
						$(this).css('background-position', '100% '+(100 - ((curscroll - o - 150) * 0.1)).toFixed(2)+'%');
					}else{
						$(this).css('background-position', '0 '+(100 - ((curscroll - o - 150) * 0.1)).toFixed(2)+'%');
					}
				}
				/*
				if ($(this).hasClass('left')){
					$(this).find('.background-slide').each(function(){
						
						if ($(this).hasClass('slid')){
							if (curscroll < (o + (h / 2))){
								$(this).removeClass('slid');
								var width = $( window ).width();
								$(this).find('.bg').animate({
								    width: width+'px'
								  }, 500);
							}
						}else{
							if (curscroll > (o + (h / 2))){
								$(this).addClass('slid');
								var width = $( window ).width();
								$(this).find('.bg').css('width', width +'px');
								
								$(this).find('.bg').animate({
								    width: Math.round(width * .4)+'px'
								  }, 500);
							}	
						}
					});
				}else if($(this).hasClass('right')){
					$(this).find('.background-slide').each(function(){
						
						if ($(this).hasClass('slid')){
							if (curscroll < (o + (h / 2))){
								$(this).removeClass('slid');
								var width = $( this ).find('.border').width();
								//fix bg first
								var pwidth = $( window ).width();
								$(this).find('.bg').css('width', pwidth +'px');
								$(this).animate({
								    left: '-'+width+'px'
								  }, 500);
							}
						}else{
							if (curscroll > (o + (h / 2))){
								$(this).addClass('slid');
								
								$(this).animate({
								    left: '0px'
								  }, 500);
							}	
						}
					});
				}*/
				
			});
		}
	});
});
function resize(){
	var width = $( window ).width();
	if (width < 1000){
		document.isMobile = 1;
	}
	/*
	$('.slideout').each(function(){
		if (width > 1000){
			
			var add = $(this).find('.background-slide .border').width();
			$(this).find('.background-slide').css('width', (width + add)+'px');
			if ($(this).hasClass('right') && !$(this).find('.background-slide').hasClass('slid')){
				$(this).find('.background-slide').css('left', '-'+add+'px');
			}
		}
	});*/
}
