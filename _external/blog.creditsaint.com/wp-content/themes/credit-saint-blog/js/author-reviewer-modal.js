var authorVisible = false;
var reviewerVisible = false;

var objAuthor = document.getElementById("person_author");
var objAuthorModal = document.getElementById("modal_author");
var objReviewer = document.getElementById("person_reviewer");
var objReviewerModal = document.getElementById("modal_reviewer");

function addIfExists(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

function mouseEnterAuthor() {
	if (!authorVisible && window.innerWidth >= 576){
		authorVisible = true;
		reviewerVisible = false;
		objAuthorModal.style.display = "inline-block";
		objReviewerModal.style.display = "none";
	}
}

function mouseLeaveAuthor() {
	objAuthorModal.style.display = "none";
	reviewerVisible = false;
	setTimeout(() => {
		authorVisible = false;
		reviewerVisible = false;
	}, 500);
}

function mouseEnterReviewer() {
	if (!reviewerVisible && window.innerWidth >= 576){
		reviewerVisible = true;					
		authorVisible = false;
		objReviewerModal.style.display = "inline-block";
		objAuthorModal.style.display = "none";
	}
}

function mouseLeaveReviewer() {
	objReviewerModal.style.display = "none";
	authorVisible = false;
	setTimeout(() => {
		reviewerVisible = false;			
	}, 500);
}

addIfExists("person_author", "mouseenter", mouseEnterAuthor);
addIfExists("modal_author", "mouseleave", mouseLeaveAuthor);
addIfExists("person_reviewer", "mouseenter", mouseEnterReviewer);
addIfExists("modal_reviewer", "mouseleave", mouseLeaveReviewer);