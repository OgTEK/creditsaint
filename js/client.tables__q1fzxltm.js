function clientTable(type) {
    this.timeReload = 180;
    this.lastPlayTime = null;
    this.type = type;
    this.listUrl = $('#' + this.type + '-form').attr('data-filter-url');
    this.page = 0;
    this.bip = true;
    this.singlePage = null;
    this.interval = null;
    this.lastNewDoc = 0;
    this.filter = {};
    this.lastHash = null;
    this.fieldsList = [];
    this._items = [];
    this._position = 0;
    this._getTimeOut = 0;
    this.lastUpdate = null;
    this.initialLoad = true;
    this.checkedCompanies = null;

    this.userStart = function () {

    };

    this.submit = function () {
        $('#' + this.type + '-form').submit();
    };

    this.start = function () {
        var this_ = this;

        if (!this.listUrl) {
            return ;
        }

        this.setBip($.cookie(this.type + '-volume') == '0' ? false : true);

        $('#' + this.type + '-pager').on('click', 'button', function () {
            this_.get($(this).attr('data-page'), true);

            if (this_.type != 'audio_list'){
				this_.reStart();
			}

            $(this).blur();

            return false;
        });

        $('#' + this_.type + '-sorter th.sorter-td').on('click', function () {
            var def = $(this).attr('data-first') ? $(this).attr('data-first') : 'asc';
            var defRev = (def == 'asc' ? 'desc' : 'asc');
			
			if ($(this).hasClass('sorter-td-' + def)) {
			    $(this).removeClass('sorter-td-' + def).addClass('sorter-td-' + defRev);
			} else if ($(this).hasClass('sorter-td-' + defRev)) {
			    $(this).removeClass('sorter-td-' + defRev);
			} else {
			    $(this).addClass('sorter-td-' + def);
			}
			var cur = this;
			//make all others have no sort by
			$('#'+this_.type + '-sorter th.sorter-td').each(function(){
				if(this != cur){
					$(this).removeClass('sorter-td-asc');
					$(this).removeClass('sorter-td-desc');
				}
			});
			

           

            this_.submit();

            $(this).blur();

            return false;
        });

        $('#' + this.type + '-form').on('submit', function () {
            this_.filter = {};

            $('[data-toggle="tooltip"]').tooltip('dispose');

            $.each($('#' + this_.type + '-filter').find('input,select').serializeArray(), function(){
                if(this.value != '') {
                    this_.filter[this.name] = this.value;
                }
            });

            this_.get(1, true);

            if (this_.type != 'audio_list'){
				this_.reStart();
			}
            return false;
        });

        $('#' + this.type + '-form, #' + this.type + '-filter').find('select').on('change', function(){
            this_.submit();
        });

        $('#' + this.type + '-form, #' + this.type + '-filter').find('input[type="text"]').on('keyup', function(event){
            if(event.which == 13) {
				this_.submit();
			}
        });

        $.each($('#' + this.type + '-form, #' + this.type + '-filter').find('input.filter-date-picker'), function () {
            var pParams = {
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                linkedCalendars : false,
                autoApply : true,
                timePicker : false,
                showCustomRangeLabel : true,
                autoUpdateInput: false,
                opens : "left",
                drops : "down",
                locale : {
                    format: window.Laravel.localeFormatDate
                }
            };

            switch ($(this).attr('data-range')) {
                case 'this_month':
                    pParams.startDate = moment().startOf('month');
                    pParams.endDate = moment().endOf('month');

                    $(this).val(pParams.startDate.format(window.Laravel.localeFormatDate) + '-' + pParams.endDate.format(window.Laravel.localeFormatDate));
                    break;
            }

            $(this).daterangepicker(pParams).on('apply.daterangepicker', function(ev, picker) {
                $(this).val(picker.startDate.format(window.Laravel.localeFormatDate) + '-' + picker.endDate.format(window.Laravel.localeFormatDate));
                this_.submit();
            }).on('cancel.daterangepicker', function(ev, picker) {
                $(this).val('');

                this_.submit();
            });
        });
        
          var type = this.type; // if you call this inside an object method that has `this.type`
          var $container = $('#' + type + '-form, #' + type + '-filter');
        
          $container.find('input.filter-date-picker-future').each(function () {
            var today = moment().startOf('day');
        
            var pParams = {
              minDate: today,
              ranges: {
                'Today': [today, today],
                'Next 7 Days': [today, moment(today).add(6, 'days')],
                'Next 30 Days': [today, moment(today).add(29, 'days')],
                'This Month': [today, moment().endOf('month')],
                'Next Month': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')]
              },
              linkedCalendars: true,
              autoApply: true,
              timePicker: false,
              showCustomRangeLabel: true,
              autoUpdateInput: false,
              opens: "left",
              drops: "down",
              locale: { format: window.Laravel.localeFormatDate },
              alwaysShowCalendars: true
            };
        
            switch ($(this).attr('data-range')) {
              case 'this_month':
                pParams.startDate = today;
                pParams.endDate = moment().endOf('month');
                $(this).val(
                  pParams.startDate.format(window.Laravel.localeFormatDate) + '-' +
                  pParams.endDate.format(window.Laravel.localeFormatDate)
                );
                break;
              case 'next_7_days':
                pParams.startDate = today;
                pParams.endDate = moment(today).add(6, 'days');
                $(this).val(
                  pParams.startDate.format(window.Laravel.localeFormatDate) + '-' +
                  pParams.endDate.format(window.Laravel.localeFormatDate)
                );
                break;
            }
        
            $(this).daterangepicker(pParams)
              .on('apply.daterangepicker', function (ev, picker) {
                $(this).val(
                  picker.startDate.format(window.Laravel.localeFormatDate) + '-' +
                  picker.endDate.format(window.Laravel.localeFormatDate)
                );
        
                // submit the closest form or a fallback form in the container
                var $form = $(this).closest('form');
                if ($form.length) {
                  $form.trigger('submit');
                } else {
                  $container.filter('form').first().trigger('submit');
                }
              })
              .on('cancel.daterangepicker', function (ev, picker) {
                $(this).val('');
        
                var $form = $(this).closest('form');
                if ($form.length) {
                  $form.trigger('submit');
                } else {
                  $container.filter('form').first().trigger('submit');
                }
              });
          });

        $('#' + this.type + '-body').on('click', '.open-duplicates', function () {
            var $list = $('#' + this_.type + '-body').children();
            var $children = $list.filter('.children[data-parent="' + $(this).attr('data-id') + '"]');
            var $parent = $list.filter('.parent[data-id="' + $(this).attr('data-id') + '"]');

            if ($parent.hasClass('children-open')) {
                $parent.removeClass('children-open');

                $children.hide();
            } else {
                $parent.addClass('children-open');

                $children.show();
            }

            $(this).blur();

            return false;
        });

        this.userStart();

        this.get(1, true);

		if (this.type != 'audio_list'){
			this.reStart();
		}
    };

    this.afterUpdate = function (data) {

    };

    this.reStart = function () {
        var this_ = this;

        clearInterval(this.interval);

        this.interval = setInterval(function () {
            this_.get(null, null, true);
        }, this.timeReload * 1000);
    };
	this.stop = function () {
		clearInterval(this.interval);
	};

    this.afterAppendLine = function ($line) {

    };

    this.hasNewItem = function () {
		
    };

    this.lineTemplate = function (val) {
        return $('<tr data-id="' + val.id + '"/>');
    };

    this.formatLine = function (val, newPage, isNew) {
        var this_ = this;
        var id = val.id;
        var parent = val.parent = val.parent ? val.parent : 0;

        var $line = this.lineTemplate(val);

        if (parent == 0) {
            $line.addClass('parent');
        } else {
            $line.addClass('children').attr('data-parent', parent);
        }

        $line.attr('data-updated_at', val.updated_at);
        $line.attr('data-id', id);
        $line.find('[data-toggle="tooltip"]').tooltip({html: true});

        this_._items[id] = ++this_._position;

        if (newPage) {
            if (parent == 0) {
                $line.show();
            } else {
                $line.hide();
            }

            $('#' + this.type + '-body').append($line);
        } else {
            var $lineOld = $('#' + this.type + '-body').find('tr[data-id="' + id + '"]');

            if ($lineOld.length) {
                if (val.updated_at != $lineOld.attr('data-updated_at')) {
                    if (parent == 0) {
                        if ($lineOld.hasClass('children-open')) {
                            $line.addClass('children-open');
                        }
                    } else {
                        if ($('#' + this.type + '-body').find('tr[data-id="' + parent + '"]').hasClass('children-open')) {
                            $line.show();
                        } else {
                            $line.hide();
                        }
                    }

                    $lineOld.replaceWith(function () {
                        $(this).find('[data-toggle="tooltip"]').tooltip('dispose');

                        return $line;
                    });
                }
            } else {
                if ((parseInt(val.created_at_stamp, 10) >= parseInt(this.lastNewDoc, 10)) || isNew) {
                    this.lastNewDoc = Math.max(this.lastNewDoc, val.created_at_stamp);

                    isNew = true;

                    if (parent == 0) {
                        $('#' + this.type + '-body').prepend($line);
                    } else {
                        var $parent = $('#' + this.type + '-body').children().filter('.parent[data-id="' + parent + '"]');

                        if ($parent.hasClass('children-open')) {
                            $line.show();
                        } else {
                            $line.hide();
                        }

                        $parent.after($line);
                    }
                }
            }
        }

        this.afterAppendLine($line);

        if (val.is_children) {
            $.each(val.children, function (subKey, subVal) {
                isNew = this_.formatLine(subVal, newPage, isNew);
            });
        }

        return isNew;
    };

    this.get = function (page, newPage, autoUpdate) {
        var this_ = this;

        clearTimeout(this._getTimeOut);

        this._getTimeOut = setTimeout(function () {
            this_.getProc(page, newPage, autoUpdate);
        }, 500);
    };

    this.userFilter = function () {

    };

    this.getProcUserSuccess = function (data) {

    };

    this.getProc = function (page, newPage, autoUpdate) {
        var this_ = this;

        if (!page) {
            page = this.page;
        }

        this.filter = {};

        $.each($('#' + this.type + '-form,#' + this.type + '-filter').find('input,select').serializeArray(), function(){
            if(this.value != '') {
                this_.filter[this.name] = this.value;
            }
        });

        this_.filter.sort = {};

        $.each($('#' + this_.type + '-sorter').find('th.sorter-td'), function(){
            if ($(this).hasClass('sorter-td-asc')) {
                this_.filter.sort[$(this).attr('data-field')] = 'asc';
            } else if($(this).hasClass('sorter-td-desc')) {
                this_.filter.sort[$(this).attr('data-field')] = 'desc';
            }
        });

        this.filter['page'] = page;
        this.filter['update'] = this.update;
		this.filter['lastUpdate'] = this.lastUpdate;
        this.userFilter();

        var fetchListUrl = this.listUrl;

        // Check to see if the current browser tab is active, and if not, return early
		if (!this.initialLoad && (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden)) {
			return;
		}

        this.initialLoad = false;

        var requestParams = this.filter;
        if (this.checkedCompanies) {
            requestParams['companies'] = this.checkedCompanies.join(',');
        }
        $.ajax({
            url: fetchListUrl,
            type: 'GET',
            data: requestParams,
            dataType: 'json',
            cache: false,
            timeout: 20000, // 20 second timeout
            error: function (request, status, error) {
                var jsonResponse = request.responseText ? JSON.parse(request.responseText) : null;
                if (jsonResponse && jsonResponse.error) console.log("Request to "+fetchListUrl+" returned error: "+jsonResponse.error);
                else if (request.responseText) console.log("Request to "+fetchListUrl+" returned error: "+request.responseText);
                else console.log("Request to "+fetchListUrl+" returned "+status+", "+error);
            },
            success: function (data) {
                if (newPage) {
                    $('#' + this_.type + '-body').empty();
                }

                $('[data-toggle="tooltip"]').tooltip('hide');

                this_.update = data.update;
				if(data.last_update){
					this_.lastUpdate = data.last_update;
				}
				
                if (data.items && (newPage || this_.lastHash != data.hash)) {
                    this_.lastHash = data.hash;
                    this_._items = {};
                    this_._position = 0;

                    if (!newPage && !this_.singlePage) {
                        newPage = data.items.current_page != this_.page;
                    }

                    this_.getProcUserSuccess(data);

                    if (data.items.data) {
                        if (!this_.singlePage) {
                            this_.page = data.items.current_page;
                        }

                        var isNew = false;

                        $.each(data.items.data, function (key, val) {
                            isNew = this_.formatLine(val, newPage, isNew);
                        });

                        if (!newPage) {
                            if (this_.singlePage && $('#' + this_.type + '-body').children().length >= data.items.per_page) {
                                $('#' + this_.type + '-body').children().last().remove();
                            }

							var avcount = 0;
							var lockcount = 0;
                            $.each($('#' + this_.type + '-body').children(), function () {
                                var id = $(this).attr('data-id');
								if($(this).attr('data-available') == '1'){
                                	if(this_._items[parseInt($(this).attr('data-av-pos'))] !== undefined){
										
										$(this).attr('position', (this_._items[parseInt($(this).attr('data-av-pos'))] + parseInt($(this).attr('data-av')) + 1 ));
										
									}else{
										$(this).attr('position', (avcount + lockcount + 1 ));
									}
                                	avcount ++;
                                }
								if($(this).hasClass('lock-item')){
									console.log('lock item '+lockcount+' - id: '+id+' - array pos: '+this_._items[id]);
									$(this).attr('position', lockcount);
									lockcount ++;
								}
                            });
							$.each($('#' + this_.type + '-body').children(), function () {
							    var id = $(this).attr('data-id');
								if (!this_._items[id] && $(this).attr('data-available') != '1') {
								    $(this).fadeOut(function () {
								        $(this).remove();
								    });
									
								}else if ($(this).attr('data-available') != '1' && !$(this).hasClass('lock-item')) {
									 $(this).attr('position', (this_._items[id] + avcount + lockcount));
								}
							});

                            $('#' + this_.type + '-body').children().sort(function (a, b) {
                                return parseInt($(a).attr('position'), 10) - parseInt($(b).attr('position'));
                            }).appendTo($('#' + this_.type + '-body'));

                            if (autoUpdate) {
                                this_.hasNewItem();
                            }
                        }
                    }

                    this_.viewPage(data.items);
                }

                this_.afterUpdate(data, newPage);
            }
        });
    };

    this.setBip = function (bip) {
        if (bip) {
            $('#' + this.type + '-volume').removeClass('fa-toggle-off').addClass('fa-toggle-on');

            this.bip = true;
        } else {
            $('#' + this.type + '-volume').addClass('fa-toggle-off').removeClass('fa-toggle-on');

            this.bip = false;
        }

        $.cookie(this.type + '-volume', this.bip ? 1 : 0, {path: '/', expires: 365});
    };

    this.playBip = function (audio) {
        if (!this.lastPlayTime || moment().diff(this.lastPlayTime) / 1000 > 1) {
            console.log('$$$');
            var $bip = $("<audio></audio>").attr({src: audio, volume: 0.8, autoplay: 'autoplay'});

            $("body").append($bip);

            setTimeout(function () {
                $bip.remove();
            }, 30 * 1000);

            this.lastPlayTime = moment();
        }
    };

    this.viewPageSelect = function (i) {
        return i == this.page ? 'btn-primary' : 'btn-secondary';
    };

    this.viewPage = function (page) {
        var pageWindow = 8;

        $('#' + this.type + '-pager').empty();

        if (!this.singlePage && page.last_page > 1) {
            var centWindow = this.page + pageWindow - 1;

            if (this.page > 1) {
                $('#' + this.type + '-pager').append('<button type="button" data-page="1" class="btn btn-sm ' + (this.viewPageSelect(1)) + '">1</button>');

                if (this.page > 2) {
                    $('#' + this.type + '-pager').append('<button type="button" class="btn btn-sm btn-secondary" disabled="disabled">…</button>');
                }
            }

            var leftWindow = this.page - (pageWindow - 1);

            for (i = leftWindow; i < leftWindow + pageWindow; i++) {
                if (i >= 2 && i < this.page) {
                    $('#' + this.type + '-pager').append('<button type="button" data-page="' + i + '" class="btn btn-sm ' + (this.viewPageSelect(i)) + '">' + i + '</button>');
                }
            }

            for (i = this.page; i <= centWindow; i++) {
                if (i <= page.last_page) {
                    $('#' + this.type + '-pager').append('<button type="button" data-page="' + i + '" class="btn btn-sm ' + (this.viewPageSelect(i)) + '">' + i + '</button>');
                }
            }

            if (page.last_page > centWindow) {
                if (page.last_page - 1 != centWindow) {
                    $('#' + this.type + '-pager').append('<button type="button" class="btn btn-sm btn-secondary" disabled="disabled">…</button>');
                }

                $('#' + this.type + '-pager').append('<button type="button" data-page="' + page.last_page + '" class="btn btn-sm ' + (this.viewPageSelect(page.last_page)) + '">' + page.last_page + '</button>');
            }

            $('#' + this.type + '-pager').show();
            $('#' + this.type + '-pager-div').show();
        } else {
            $('#' + this.type + '-pager').hide();
            $('#' + this.type + '-pager-div').hide();
        }
    };
}
