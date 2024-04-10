# savvisig-js


### Bind Signature Field
```javascript
$('.signature').savviSig({
  required:false,
  id: 'savvi-siggy',
  dataImage: false,
  dataDate: false,
  group: false,
  required: true
});
```

### Global Events
```javascript
$(document).on("signaturesUpdated",function(){
    /* Do stuff */
});
```

### Build
``` npx mix --production
```
