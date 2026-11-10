$(document).ready(function(){
  let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

  if (!isMobile) {
      $(".privacy p").on("click","a.question", function (event) {
          event.preventDefault();
          let id  = $(this).attr('href');
          let top = $(id).offset().top - 105;
          $('body,html').animate({scrollTop: top}, 100);
      });
  }
});
