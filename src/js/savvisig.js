var SavviSig = function(options, element, callback) {
  var self = this;
  var callback = callback || function(){};
  var defaults = { required:false,
                   id: 'savvi-siggy',
                   dataImage: false,
                   dataDate: false,
                   group: false,
                   required: true
                 };
  self.uid = 0; //keeps track of siggies
  self.options = $.extend(true, defaults, options);

  self.init(element,self.options);

  if (!$('[data-sig-id]').length){
    self.buildSignatureModal(element,self.options);
    self.bindSignatureModal(element,self.options);
  }
  self.buildSignatureField(element,self.options);
  self.bindSignatureField(element,self.options);


};

SavviSig.prototype.init = function(element,options) {
  var self = this;
  /* Make sure we have all the stuff */
  if(!self.checkIncludes()){
    return false;
  }
  /* Update UID */
  $('body').find('[data-savvisig-id]').each(function(){
    self.uid++;
  });
  $(element).attr('data-savvisig-id',self.uid);
};

SavviSig.prototype.checkIncludes = function() {
  var isOkay = true;
  if (!window.jQuery) {
    console.log('[-] Error: jQuery is not installed.'); isOkay = false;
  }
  if (!$.isFunction($.fn.modal)) {
    console.log('[-] Error: bootstrap is not installed.'); isOkay = false;
  }
  if (!$.isFunction($.fn.jSignature)){
    console.log('[-] Error: jSignature is not installed.'); isOkay = false;
  }
  return isOkay;
};

SavviSig.prototype.buildSignatureModal = function(element,options){
  var m = '';
  m += '<div data-id="sf-modal-sig" class="modal fade" role="dialog" data-owner="'+options.id+'">';
  m += '<div class="modal-dialog modal-lg">';
  m += '<form class="sf-sig-form modal-content">';
  m += '<div class="modal-header">';
  m += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
  m += '<h4 class="modal-title">Edit Signature</h4>';
  m += '</div>';
  m += '<div class="modal-body">';
  m += '<div class="sf-sign-area"></div>'
  m += '</div>';
  m += '<div class="modal-footer">';
  m += '<button type="button" class="btn btn-default" data-dismiss="modal"><i class="glyphicon glyphicon-remove"></i> Close</button>';
  m += '<button type="button" data-id="sf-button-sign" class="btn btn-default"><i class="glyphicon glyphicon-pencil"></i> Sign</button>';
  m += '</div>';
  m += '</form>';
  m += '</div>';
  m += '</div>';
  $('body').append(m);
};

SavviSig.prototype.buildSignatureField = function(element,options){
  var self = this;
  var m = '';
  var groupName = '';
  var required = '';
  if (self.options.group){
    groupName = self.options.group;
  }
  if (self.options.required){
    required = 'required="required"';
  }
  /* If we're using formbuilder */
  if ($(element).attr('data-type') == 'signature'){
    $(element).attr('data-sig-id',self.uid);
    $(element).attr('data-group',self.uid);
    $(element).addClass('sf-signature');
  } else {
    m += '<div data-sig-id="sig-'+self.uid+'" class="form-group-lg form-group has-feedback sf-signature" data-group="'+groupName+'">';
    m += '<span class="glyphicon form-control-feedback glyphicon-ok" aria-hidden="true">';
    m += '</span>';
    m += '<input '+required+' id="sf-data-'+self.uid+'" name="sf-data-'+self.uid+'" class="form-control sf-sig-data sf-field" type="text">';
    m += '<input '+required+' id="sf-data-'+self.uid+'" name="sf-data-'+self.uid+'" class="form-control sf-sig-date sf-field" type="text">';
    m += '<div class="sf-sig-wrapper" data-action="sign">';
    m += '<div class="form-control">';
    m += '<img class="signature-image" src="" />';
    m += '<div class="sf-sig-note">Sign Here</div>';
    m += '</div>';
    m += '<div class="sf-sig-panel">';
    m += '<button type="button" class="sf-sig-edit btn btn-default btn-lg">Edit</button>';
    m += '</div>';
    m += '</div>';
    m += '</div>';
    $(element).html(m);
  }
};

SavviSig.prototype.bindSignatureField = function(element,options){
  var self = this;
  var $modalSig = $('[data-id="sf-modal-sig"]');
  var $holderSig = $(element).find('[data-sig-id="sig-'+self.uid+'"]');
  var $signingArea = $modalSig.find('.sf-sign-area');
  var $sigData = $holderSig.find('.sf-sig-data');
  var $sigDate = $holderSig.find('.sf-sig-date');

  /* We do not want people typing stuff in these, but we
     still want them to retain the ability to be focused by
     the validator */
  $sigData.on('focus',function(){
    $sigData.blur();
  });
  $sigDate.on('focus',function(){
    $sigDate.blur();
  });

  /* Populate with defaults */
  self.updateSignature(element,options,options.dataImage,options.dataDate);

  $holderSig.find('.sf-sig-edit').on('click tap', function(){
    self.openModal(element,options);
    $sigData.focus(); //For validator
  });

  $holderSig.find('[data-action="sign"]').on('click tap',function(){

    var latestSigData = self.getLatestSig($holderSig);

    if (latestSigData == '' || (latestSigData == $sigData.val())){
      /* Edit */
      self.openModal(element,options);
    }else{
      /* Signed! */
      self.updateSignature(element,options,latestSigData,(new Date()).toISOString());
      $sigData.trigger('blur');
    }
    $sigData.focus(); //For validator

  });
};
/* If the sigs are for the same person, get the data of the latest sig */
SavviSig.prototype.getLatestSig = function($holderSig){
  var latestSigData = '';
  var oldDate = 0;
  var $sigDate = $holderSig.find('.sf-sig-date');

  if ($sigDate.val().length > 1){
    oldDate = new Date($sigDate.val());
  }

  $('[data-sig-id]').each(function(){
    var $rSig = $(this);
    var $rSigData = $rSig.find('.sf-sig-data');
    var $rSigDate = $rSig.find('.sf-sig-date');
    var newDate = new Date($rSigDate.val());

    if ($rSig.attr('data-group') !== ''){
      if ($rSig.attr('data-group') == $holderSig.attr('data-group')){
        if ( newDate > oldDate ){
          oldDate = newDate;
          latestSigData = $rSigData.val();
        }
      }
    }
  });
  return latestSigData;
};

SavviSig.prototype.openModal = function(element,options){
  var self = this;
  var $modalSig = $('[data-id="sf-modal-sig"]');
  var $signingArea = $modalSig.find('.sf-sign-area');
  var $sigSubmit = $modalSig.find('[data-id="sf-button-sign"]');
  var canSave = false;

  /* When the modal loads up */
  $modalSig.off('show.bs.modal');
  $modalSig.on('show.bs.modal', function (e) {
    canSave = false;
    $signingArea.jSignature('reset');
    $signingArea.resize();
    $sigSubmit[0].disabled = true;
    $signingArea.off('change');
    $signingArea.bind('change', function(e){
      var d = $(e.target).jSignature("getData", "native");
      // if there are more than 2 strokes in the signature
      // or if there is just one stroke, but it has more than 20 points
      if ( d.length > 1 || ( d.length === 1 && d[0].x.length > 5 ) ){
        // we show "Submit" button
        // $(event.target).unbind('change')
        canSave = true;
        $sigSubmit[0].disabled = false;
      } else {
        canSave = false;
        $sigSubmit[0].disabled = true;
      }
    });
  });
  /* When the user submits the signature */
  $sigSubmit.off('click tap');
  $sigSubmit.on('click tap',function(){
    if (canSave == true){
      self.updateSignature(element,options,$signingArea.jSignature("getData","image"),(new Date()).toISOString());
      $modalSig.modal('hide');
    }
  });
  $modalSig.modal('show');
};


SavviSig.prototype.updateSignature = function(element,options,dataImage,dataDate){
  var self = this;
  var $holderSig = $(element).find('[data-sig-id="sig-'+self.uid+'"]');
  var $sigImage = $holderSig.find('.signature-image');
  var $sigData = $holderSig.find('.sf-sig-data');
  var $sigDate = $holderSig.find('.sf-sig-date');
  var $sigNote = $holderSig.find('.sf-sig-note');
  var $sigPanel = $holderSig.find('.sf-sig-panel');
  if (!dataImage || !dataDate){
    return false;
  }
  $sigImage.attr('src',"data:"+dataImage);
  $sigDate.val((new Date()).toISOString());
  $sigData.val(dataImage);
  $sigNote.fadeOut('fast');
  $sigPanel.fadeIn('fast');
  $sigData.trigger('blur');

  /* Reset Grouped signatures */
  $('[data-sig-id]').each(function(){
    var $rSig = $(this);
    if ($rSig.attr('data-group') !== ''){
      if ($rSig.attr('data-group') == $holderSig.attr('data-group')){
        if ($rSig.find('.sf-sig-data').val() !== $sigData.val()){
          $rSig.find('.sf-sig-note').fadeIn('fast');
          $rSig.find('.sf-sig-date').val(''); //clear the date so they must sign again for an updated sig.
        }
      }
    }
  });
};

SavviSig.prototype.bindSignatureModal = function(element,options){
  var self = this;
  var $modalSig = $('[data-id="sf-modal-sig"]');
  var $signingArea = $modalSig.find('.sf-sign-area');

  $signingArea.jSignature({'height':'350px',
                      'width':'100%',
                      'color': '#000',
                      'lineWidth': 2,
                      'decor-color': 'transparent'});
  $signingArea.resize();
};


(function($) {
  $.fn.savviSig = function(options,callback) {
    this.each(function() {
      var savviSig = new SavviSig(options, this, callback);
      return savviSig;
    });
  };
})(jQuery);