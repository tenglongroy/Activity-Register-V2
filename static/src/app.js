import {MDCTopAppBar} from '@material/top-app-bar';
import {MDCDrawer} from "@material/drawer";
import {MDCRipple} from '@material/ripple';
import mdcAutoInit from '@material/auto-init';
import {MDCTextField} from '@material/textfield';
import {MDCSelect} from '@material/select';
import {MDCFormField} from '@material/form-field';
import {MDCRadio} from '@material/radio';
import {MDCDialog} from '@material/dialog';
import {MDCTabBar} from '@material/tab-bar';
import {MDCSnackbar} from '@material/snackbar';
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';

import 'bootstrap/js/dist/modal';

import * as mdc from 'material-components-web';  //https://github.com/rails/webpacker/issues/1044
import $ from "jquery";

window.mdc = mdc;


//discontinued ... span-4 -> span-10, 16-9 -> square, customised-grid-card -> customised-row-card
//toggle a class at the container and change the style will do the trick instead of changing classes for each mdc-card
var GridCardMDC_HTML = `
    <div class="mdc-layout-grid__cell mdc-layout-grid__cell--span-4">
        <div class="mdc-card customised-grid-card mdc-elevation--z4" data-act-id="{actID}" data-max="{max}" data-min="{min}" data-cur-num="{cur}" data-makerID="{makerID}" data-type="{type}" data-create-time={create-time}>
            <a href="{detail}" class="mdc-card__primary-action" tabindex="{tabindex}">
                <div class="mdc-card__media mdc-card__media--16-9" style="background-image: url({imgurl});"></div>
                <div class="customised-card__primary">
                    <h2 class="customised-card__title mdc-typography mdc-typography--headline5">{title}</h2>
                    <h3 class="customised-card__subtitle mdc-typography mdc-typography--subtitle1">{subtitle}</h3>
                    <div class="customised-card__description mdc-typography mdc-typography--body2">{body}</div>
                </div>
            </a>
            <div class="customised-card__other-info">
                <p class="mdc-typography--overline">{type}</p>
                <a href="{creator}" class="mdc-typography--caption creator-nickname">{nickname}</a>
            </div>
            <div class="progress-wrapper">
                <div role="progressbar" class="mdc-linear-progress">
                    <div class="mdc-linear-progress__buffering-dots" title="max capacity: {max}"></div>
                    <div class="mdc-linear-progress__buffer" title="least headcount to commence: {cur}/{min}"></div>
                    <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar" title="current number of participants: {cur}/{max}">
                        <span class="mdc-linear-progress__bar-inner"></span>
                    </div>
                    <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                        <span class="mdc-linear-progress__bar-inner"></span>
                    </div>
                </div>
            </div>
            <div class="mdc-card__actions">
                <div class="mdc-card__action-buttons">
                    <a href="{detail}" class="mdc-card__action--button"><button class="mdc-button mdc-card__action mdc-card__action--button mdc-button--raised ">Details</button></a>
                    <button class="join-button {join-button-quit} mdc-button mdc-card__action mdc-card__action--button mdc-button--raised ">{Join}</button>
                </div>
                <div class="mdc-card__action-icons">
                    <button class="favourite-button mdc-icon-button mdc-card__action mdc-card__action--icon mdc-ripple-upgraded--unbounded" aria-pressed="false" aria-label="Add to favorites" title="Add to favorites" data-mdc-ripple-is-unbounded="true">
                        <i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">favorite</i>
                        <i class="material-icons mdc-icon-button__icon">favorite_border</i>
                    </button>
                    <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon mdc-ripple-upgraded--unbounded" title="More options" data-mdc-ripple-is-unbounded="true">more_vert</button>
                </div>
            </div>
        </div>
    </div>`;
var headerAction_HTML = `<a class="header-actions-item" href="{URL}" aria-label="{label}">
<button class="mdc-button mdc-button--raised" id="{id}">
    {iconHTML}
    <span class="mdc-button__label">{text}</span>
</button>
</a>`;


(function() {

//decide which page it is, so to do different things
if(window.location.pathname == '/'){
    const activityContainer = document.querySelector('.mdc-layout-grid__inner.activity-container');
    for (let index = 0; index < act_list_js.length; index++){
        var tempCardHTML = GridCardMDC_HTML;
        var currentAct = act_list_js[index];
        var start_time = new Date(currentAct['start_time']);
        var create_time = new Date(currentAct['create_time']);
        tempCardHTML = tempCardHTML.replace('{imgurl}', currentAct['imgurl']).replace('{title}', currentAct['title']).replace('{subtitle}', 'starting at '+start_time.toDateString()+' '+start_time.toTimeString().slice(0,8)).replace('{body}', currentAct['description'].length == 0 ?"The creator didn't leave a description.":currentAct['description']).replace('{tabindex}', index).replace(/{type}/g, currentAct['activity_type']).replace('{nickname}', currentAct['nickname']).replace(/{cur}/g, currentAct['current_number']).replace(/{min}/g, currentAct['min_participant']).replace(/{max}/g, currentAct['max_participant']).replace('{creator}', currentAct['creator_url']).replace(/{detail}/g, currentAct['detail_url']).replace('{actID}', currentAct['act_id']).replace('{create-time}', create_time.toDateString()+' '+create_time.toTimeString().slice(0,8));
        if(join_list_js_new.indexOf(currentAct['act_id']) > -1){    //it's in the joinlist, should show as "QUIT"
            tempCardHTML = tempCardHTML.replace('{join-button-quit}', 'join-button-quit').replace('{Join}', 'Quit');
        }
        else{
            tempCardHTML = tempCardHTML.replace('{join-button-quit}', '').replace('{Join}', 'Join');
        }
        activityContainer.insertAdjacentHTML('beforeend', tempCardHTML);
        console.log(currentAct);
    }
    actionAfterLoginLogout({
        joinList: join_list_js_new,
        favouriteList: favourite_list
    });
    
    const toggleButtons = [].map.call(document.querySelectorAll('.mdc-linear-progress'), function(el) {
        var progressBar = mdc.linearProgress.MDCLinearProgress.attachTo(el);
        progressBar.progress = parseInt(el.closest('.mdc-card').dataset.curNum) / parseInt(el.closest('.mdc-card').dataset.max);
        progressBar.buffer = parseInt(el.closest('.mdc-card').dataset.min) / parseInt(el.closest('.mdc-card').dataset.max);
    });

    /*const gridViewButton = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('grid-view-toggle'));
    gridViewButton.on = true;
    const listViewButton = new mdc.iconButton.MDCIconButtonToggle(document.getElementById('list-view-toggle'));
    listViewButton.on = false;
    document.getElementById('grid-view-toggle').addEventListener('click', function(){
        if(!gridViewButton.on){
            listViewButton.on = !listViewButton.on;
            gridViewButton.on = !gridViewButton.on;
            document.querySelector('.activity-container').classList.remove('list-view-on');
        }
    });
    document.getElementById('list-view-toggle').addEventListener('click', function(){
        if(!listViewButton.on){
            listViewButton.on = !listViewButton.on;
            gridViewButton.on = !gridViewButton.on;
            document.querySelector('.activity-container').classList.add('list-view-on');
        }
    });*/
    document.querySelector('.activity-action-container .container .right-actions .view-toggle .grid-toggle').addEventListener('click', function(evt){
        if(this.closest('.view-toggle').classList.contains('list-on')){
            this.closest('.view-toggle').classList.remove('list-on');
            document.querySelector('.activity-container').classList.remove('list-view-on');
        }
    });
    document.querySelector('.activity-action-container .container .right-actions .view-toggle .list-toggle').addEventListener('click', function(evt){
        if(!this.closest('.view-toggle').classList.contains('list-on')){
            this.closest('.view-toggle').classList.add('list-on');
            document.querySelector('.activity-container').classList.add('list-view-on');
        }
    });

    InitRipple(document.querySelectorAll('.activity-action-container .container .right-actions .view-toggle i'));
    InitTextField(document.querySelectorAll('.create-modal .mdc-text-field'));
}






/******** MDC Init ********/

const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

/**
 * login / sign up button, dialog and forms.
 */
const loginSignUpDialog = new MDCDialog(document.querySelector('.login-sign-up-dialog'));
loginSignUpDialog.autoStackButtons = false;
var loginTextFields = InitTextField(document.querySelectorAll('.login-sign-up-dialog #login-form .mdc-text-field'));
var signUpTextFields = InitTextField(document.querySelectorAll('.login-sign-up-dialog #sign-up-form .mdc-text-field'));
var passwordHelperText = new MDCTextFieldHelperText(document.querySelector('.login-sign-up-dialog #sign-up-form .mdc-text-field-helper-text'));
const tabBar = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
var loginSignUpButton = document.getElementById('login-sign-up-button');
/* if(loginSignUpButton != null){
    loginSignUpButton.addEventListener('click', function(evt){
        loginSignUpDialog.open();
    });
} */
document.addEventListener('click', function(evt){
    if(evt.target && (evt.target.id == 'login-sign-up-button' || evt.target.parentNode.id == 'login-sign-up-button')){
        loginSignUpDialog.open();
        loginSignUpDialog.root_.querySelector('.login-dialog-message').textContent = "";
        loginSignUpDialog.root_.querySelector('.sign-up-dialog-message').textContent = "";
    }
    else if(evt.target && (evt.target.id == 'logout-button' || evt.target.parentNode.id == 'logout-button')){
        logoutButtonAction(evt);
    }
});

//show corresponding form according to tab click
document.querySelectorAll('.login-sign-up-dialog .mdc-tab').forEach(function(ele){
    ele.addEventListener('click', function(e){
        var ajaxForm = document.querySelector(this.dataset.tabTarget);
        ajaxForm.parentNode.querySelectorAll('form.active').forEach(function(formEle){
            formEle.classList.remove('active');
        });
        ajaxForm.classList.add('active');
    });
});
//press ENTER in the form will trigger this submit button.
//form on('submit') doesn't work because when triggering this button, mdc-web will close dialog automatically, so need to stopPropagation() in this button.
document.getElementById('login-submit').addEventListener('click', function(e){      //TODO - this won't trigger after re-enter to DOM by JavaScript
    e.preventDefault();     //prevent the event on current element
    e.stopPropagation();    //stop from escalating to parent elements
    e.target.closest('.mdc-dialog').classList.add('loading');
    $.ajax({
        url: $SCRIPT_ROOT + '/loginAjax',
        type: 'POST',
        data: {
            username: this.closest('form').querySelector('.username').value,
            password: this.closest('form').querySelector('.password').value
        },
        dataType: 'html',
        timeout: 1000,
        error: function(){
            currentForm.querySelector('.login-dialog-message').textContent = 'Error connecting server, please refresh or try again later.';
        },
        success: function(response,status,xhr){
            var formattedResponse = JSON.parse(response);
            console.log(formattedResponse);
            let currentDialog = e.target.closest('.mdc-dialog');
            let currentForm = e.target.closest('form');
            currentForm.querySelector('.login-dialog-message').textContent = formattedResponse['message'];
            if(formattedResponse['logged_in']){
                var headerActions = document.querySelector('.header-actions');
                setTimeout(function(){     //fake it so loading icon can be seen
                    currentDialog.classList.remove('loading');
                    var profileHTML = headerAction_HTML.replace('{URL}', formattedResponse['profileURL']).replace('{label}', 'Profile').replace('{iconHTML}', '<i class="material-icons mdc-button__icon">person_outline</i>').replace('{text}', formattedResponse['nickname']).replace('{id}', 'profile-button');
                    var logoutHTML = headerAction_HTML.replace('{URL}', '#').replace('{label}', 'Logout').replace('{iconHTML}', '<i class="material-icons mdc-button__icon">portrait</i>').replace('{text}', 'Logout').replace('{id}', 'logout-button');
                    headerActions.insertAdjacentHTML('beforeend', profileHTML);
                    headerActions.insertAdjacentHTML('beforeend', logoutHTML);
                    loginSignUpDialog.close();
                    window.logged_in = true;
                    actionAfterLoginLogout({
                        joinList: formattedResponse['joinlist_ajax'].map((item) => {return item[0];}),
                        favouriteList: formattedResponse['favouritelist_ajax'].map((item) => {return item[0];})
                    });
                }, 1000);
                headerActions.querySelectorAll('.header-actions-item').forEach(ele => ele.parentNode.removeChild(ele));
                loginTextFields.forEach(function(ele){
                    ele.value = "";
                    ele.input_.blur();
                    ele.foundation_.deactivateFocus();
                });
            }
            else{
                //failed, shake dialog
                currentDialog.classList.remove('loading');
                loginTextFields.forEach(function(ele){
                    ele.valid = false;
                });
            }
        },
    });
})
document.getElementById('sign-up-submit').addEventListener('click', function(e){
    e.preventDefault();     //prevent the event on current element
    e.stopPropagation();    //stop from escalating to parent elements
    e.target.closest('.mdc-dialog').classList.add('loading');
    $.ajax({
        url: $SCRIPT_ROOT + '/registerAjax',
        type: 'POST',
        data: {
            username: this.closest('form').querySelector('.username').value,
            password: this.closest('form').querySelector('.password').value,
            nickname: this.closest('form').querySelector('.nickname').value
        },
        dataType: 'html',
        timeout: 1000,
        error: function(){
            currentForm.querySelector('.sign-up-dialog-message').textContent = 'Error connecting server, please refresh or try again later.';
        },
        success: function(response,status,xhr){
            var formattedResponse = JSON.parse(response);
            console.log(formattedResponse);
            let currentDialog = e.target.closest('.mdc-dialog');
            let currentForm = e.target.closest('form');
            currentForm.querySelector('.sign-up-dialog-message').textContent = formattedResponse['message'];
            if(formattedResponse['signup_OK']){
                var headerActions = document.querySelector('.header-actions');
                setTimeout(function(){     //fake it so loading icon can be seen
                    currentDialog.classList.remove('loading');
                    var profileHTML = headerAction_HTML.replace('{URL}', formattedResponse['profileURL']).replace('{label}', 'Profile').replace('{iconHTML}', '<i class="material-icons mdc-button__icon">person_outline</i>').replace('{text}', formattedResponse['nickname']).replace('{id}', 'profile-button');
                    var logoutHTML = headerAction_HTML.replace('{URL}', '#').replace('{label}', 'Logout').replace('{iconHTML}', '<i class="material-icons mdc-button__icon">portrait</i>').replace('{text}', 'Logout').replace('{id}', 'logout-button');
                    headerActions.insertAdjacentHTML('beforeend', profileHTML);
                    headerActions.insertAdjacentHTML('beforeend', logoutHTML);
                    loginSignUpDialog.close();
                    window.logged_in = true;
                    actionAfterLoginLogout();
                }, 1000);
                headerActions.querySelectorAll('.header-actions-item').forEach(ele => ele.parentNode.removeChild(ele));
                signUpTextFields.forEach(function(ele){
                    ele.value = "";
                    ele.input_.blur();
                    ele.foundation_.deactivateFocus();
                });
            }
            else{
                //failed, shake dialog
                setTimeout(function(){
                    currentDialog.classList.remove('loading');
                    loginTextFields.forEach(function(ele){
                        ele.valid = false;
                    });
                }, 500);
            }
        },
    });
})
// end login / sign up

document.querySelectorAll('.create-activity-button').forEach(function(ele){
    openActivityCreateFormAction(ele);
    createActivityAction(document.querySelector('.create-modal .create-button'));
    document.getElementById('uploadActivityImage').addEventListener("change", handleFiles, false);
});

//Join button.
document.querySelectorAll('.mdc-card .join-button').forEach(function(ele){
    MDCRipple.attachTo(ele);
    joinButtonAction(ele);
});

//Favourite button.
document.querySelectorAll('.mdc-card .favourite-button').forEach(function(ele){
    favouriteButtonAction(ele);
});




const topAppBarElement = document.querySelector('.mdc-top-app-bar');
const topAppBar = new MDCTopAppBar(topAppBarElement);

InitRipple(document.querySelectorAll('.mdc-button, .mdc-fab, .mdc-card__primary-action'));


const toggleButtons = [].map.call(document.querySelectorAll('.mdc-icon-button'), function(el) {
    return new mdc.iconButton.MDCIconButtonToggle(el);
});


const selects = [].map.call(document.querySelectorAll('.mdc-select'), function(el) {
    let select = new MDCSelect(el);
    select.listen('MDCSelect:change', () => {
        //alert(`Selected option at index ${select.selectedIndex} with value "${select.value}"`);
    });
    return select;
});


const radios = [].map.call(document.querySelectorAll('.mdc-radio'), function(el) {
    return new MDCRadio(el);
});

const formFields = [].map.call(document.querySelectorAll('.mdc-form-field'), function(el) {
    return new MDCFormField(el);
});
// formField.input = radio;


function InitRipple(elementList){
    var ripples = [].map.call(elementList, function(el) {
        return new MDCRipple(el);
    });
    return ripples;
}

function InitTextField(elementList){
    var textFields = [].map.call(elementList, function(el) {
        return new MDCTextField(el);
    });
    return textFields;
}

//if given joinlist, then it's a login action, otherwise a logout action
function actionAfterLoginLogout(jsonData){
    var data = Object.assign({
        joinList: undefined,
        favouriteList: undefined
    }, jsonData);
    if(data.joinList != undefined){
        //joinList = joinList.map((item) => {return item[0];});
        //favouriteList = favouriteList.map((item) => {return item[0];});
        //this is to update the Join button
        document.querySelectorAll('.activity-container .mdc-card').forEach(function(ele, ind){
            let joinButton = ele.querySelector('.join-button');
            if(data.joinList.indexOf(parseInt(ele.dataset.actId)) > -1){    //it's in the joinList, should show as "QUIT"
                joinButton.textContent = 'Quit';
                joinButton.classList.add('join-button-quit');
            }
            else{
                joinButton.textContent = 'Join';
                joinButton.classList.remove('join-button-quit');
            }

            let favouriteIcon = new mdc.iconButton.MDCIconButtonToggle(ele.querySelector('.favourite-button'));
            if(data.favouriteList.indexOf(parseInt(ele.dataset.actId)) > -1){
                favouriteIcon.on = true;
            }
            else{
                favouriteIcon.on = false;
            }
        });
    }
    else{
        //reverse back the buttons to default
        document.querySelectorAll('.activity-container .mdc-card').forEach(function(ele, ind){
            let joinButton = ele.querySelector('.join-button');
            joinButton.textContent = 'Join';
            joinButton.classList.remove('join-button-quit');

            let favouriteIcon = new mdc.iconButton.MDCIconButtonToggle(ele.querySelector('.favourite-button'));
            favouriteIcon.on = false;
        });
    }
}

function logoutButtonAction(event){
    event.preventDefault();     //prevent the event on current element
    event.stopPropagation();    //stop from escalating to parent elements
    $.ajax({
        url: $SCRIPT_ROOT + '/logoutAjax',
        type: 'POST',
        data: {
        },
        dataType: 'html',
        timeout: 1000,
        error: function(){
            snackbar.labelText = 'Error connecting server, please refresh or try again later.';
            snackbar.open();
        },
        success: function(response,status,xhr){
            var formattedResponse = JSON.parse(response);
            console.log(formattedResponse);
            if(!formattedResponse['logged_in']){
                var headerActions = document.querySelector('.header-actions');
                setTimeout(function(){     //fake it so loading icon can be seen
                    var loginHTML = headerAction_HTML.replace('{URL}', '#').replace('{label}', 'Login / Sign up').replace('{iconHTML}', '').replace('{text}', 'Login / Sign up').replace('{id}', 'login-sign-up-button');
                    headerActions.insertAdjacentHTML('beforeend', loginHTML);
                    snackbar.labelText = 'Logged out success.';
                    snackbar.open();
                    window.logged_in = false;
                    actionAfterLoginLogout();
                }, 500);
                headerActions.querySelectorAll('.header-actions-item').forEach(ele => ele.parentNode.removeChild(ele));
            }
            else{   //failed
                setTimeout(function(){
                    snackbar.labelText = 'Error logging out, please refresh or try again later.';
                    snackbar.open();
                }, 300);
            }
        },
    });
}

function openActivityCreateFormAction(element){
    element.addEventListener('click', function(evt){
        if(window.logged_in){
            return true;
        }
        else{
            evt.preventDefault();
            evt.stopPropagation();
            loginSignUpDialog.open();
        }
    });
}

function joinButtonAction(element){
    element.addEventListener('click', function(evt){
        evt.preventDefault();
        //evt.stopPropagation();
        if(window.logged_in){
            let toJoin = !this.classList.contains('join-button-quit');      //doesn't contain 'join-button-quit', it's a Join button
            $.ajax({
                url: $SCRIPT_ROOT + '/joinQuitActivityAjax',
                type: 'POST',
                data: {
                    'activity_id': this.closest('.mdc-card').dataset.actId,
                    'action_type': toJoin ? 'join':'quit'
                },
                dataType: 'html',
                timeout: 1000,
                error: function(){
                    snackbar.labelText = "Error connecting server, please refresh or try again later.";
                    snackbar.open();
                    element.on = false;
                },
                success: function(response,status,xhr){
                    var formattedResponse = JSON.parse(response);
                    console.log(formattedResponse);
                    if(!formattedResponse['success']){
                        snackbar.labelText = formattedResponse['message'];
                        snackbar.open();
                        return;
                    }
                    let cardElement = element.closest('.mdc-card');
                    let progressElement = new mdc.linearProgress.MDCLinearProgress(cardElement.querySelector('.mdc-linear-progress'));
                    let toJoin = formattedResponse['action_type'] == 'join';
                    snackbar.labelText = "Activity '"+ cardElement.querySelector('.customised-card__title').textContent+"' "+ (toJoin ? "joined.":"quit.");
                    snackbar.open();
                    if(toJoin){     //successfully join, change the button to "QUIT"
                        element.textContent = 'Quit';
                        element.classList.add('join-button-quit');
                    }
                    else{           //successfully quit, change the button to "JOIN"
                        element.textContent = 'Join';
                        element.classList.remove('join-button-quit');
                    }
                    cardElement.dataset.curNum = parseInt(cardElement.dataset.curNum)+ (toJoin? 1:-1);
                    progressElement.progress = parseInt(cardElement.dataset.curNum) / parseInt(cardElement.dataset.max);
                    progressElement.root_.querySelector('.mdc-linear-progress__bar').title = 'current number of participants: '+ cardElement.dataset.curNum+'/'+cardElement.dataset.max;
                }
            });
        }
        else{
            loginSignUpDialog.open();
        }
    });
}
function favouriteButtonAction(element){
    let currentElement = new mdc.iconButton.MDCIconButtonToggle(element);
    element.addEventListener('click', function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        if(window.logged_in){
            let toAdd = !currentElement.on;      //depends on element's ON state
            $.ajax({
                url: $SCRIPT_ROOT + '/addRemoveFavouriteAjax',
                type: 'POST',
                data: {
                    'activity_id': this.closest('.mdc-card').dataset.actId,
                    'action_type': toAdd ? 'add':'remove'
                },
                dataType: 'html',
                timeout: 1000,
                error: function(){
                    snackbar.labelText = "Error connecting server, please refresh or try again later.";
                    snackbar.open();
                    currentElement.on = !currentElement.on;     // if error, reverse it back to previous state
                },
                success: function(response,status,xhr){
                    var formattedResponse = JSON.parse(response);
                    console.log(formattedResponse);
                    //currentElement.on = !currentElement.on;
                    snackbar.labelText = "Activity '"+element.closest('.mdc-card').querySelector('.customised-card__title').textContent+"' "+ (toAdd ? "added.":"removed.");
                    snackbar.open();
                    if(!formattedResponse['success']){
                        currentElement.on = !currentElement.on;
                    }
                }
            });
        }
        else{
            loginSignUpDialog.open();
            currentElement.on = !currentElement.on;
        }
    });
}

function createActivityAction(element){
    if(element == null || element == undefined)
        return false;
    element.addEventListener('click', function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        /*var img = this.closest('.create-modal').querySelector('#uploadActivityImage').files[0];
        var imgData = "";
        if(img && img.type.indexOf('image')==0 && img.type && /\.(?:jpg|png|gif|bmp)$/.test(img.name)){
            var reader = new FileReader();
            reader.addEventListener('load', function(){
                imgData = this.result;*/
        var createModal = document.querySelector('.create-modal');
        var formData = new FormData(createModal.querySelector('form'));
        $.ajax({
            url: $SCRIPT_ROOT + '/createActivityAjax',
            type: 'POST',
            /*data: {
                'title': createModal.querySelector('#title').value,
                'max': createModal.querySelector('#max_participant').value,
                'min': createModal.querySelector('#min_participant').value,
                'start_time': createModal.querySelector('#start_time').value,
                'activity_type': createModal.querySelector('#activity_type').value,
                'imageData': imgData,
                'self-join-radio-set': createModal.querySelector('input[name="self-join-radio-set"]:checked').value
            },*/
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            timeout: 2000,
            error: function(){
                snackbar.labelText = "Error connecting server, please refresh or try again later.";
                snackbar.open();
            },
            success: function(response,status,xhr){
                //var formattedResponse = JSON.parse(response);
                console.log(response);
                snackbar.labelText = response['message'];
                snackbar.open();

                var activityContainer = document.querySelector('.mdc-layout-grid__inner.activity-container');
                var tempCardHTML = GridCardMDC_HTML;
                var start_time = new Date(response['start_time']);
                var create_time = new Date(response['create_time']);
                tempCardHTML = tempCardHTML.replace('{imgurl}', response['imgurl']).replace('{title}', response['title']).replace('{subtitle}', 'starting at '+start_time.toDateString()+' '+start_time.toTimeString().slice(0,8)).replace('{body}', response['description'].length == 0 ?"The creator didn't leave a description.":response['description']).replace('{tabindex}', '-1').replace(/{type}/g, response['activity_type']).replace('{nickname}', response['nickname']).replace(/{cur}/g, response['current_number']).replace(/{min}/g, response['min_participant']).replace(/{max}/g, response['max_participant']).replace('{creator}', response['creator_url']).replace(/{detail}/g, response['detail_url']).replace('{actID}', response['act_id']).replace('{create-time}', create_time.toDateString()+' '+create_time.toTimeString().slice(0,8));
                if(response['self_participate'] == '1'){    //it's in the joinlist, should show as "QUIT"
                    tempCardHTML = tempCardHTML.replace('{join-button-quit}', 'join-button-quit').replace('{Join}', 'Quit');
                }
                else{
                    tempCardHTML = tempCardHTML.replace('{join-button-quit}', '').replace('{Join}', 'Join');
                }
                var tempElement = htmlToElement(tempCardHTML);
                activityContainer.append(tempElement);
                var progressBar = mdc.linearProgress.MDCLinearProgress.attachTo(tempElement.querySelector('.mdc-linear-progress'));
                progressBar.progress = parseInt(tempElement.querySelector('.mdc-card').dataset.curNum) / parseInt(tempElement.querySelector('.mdc-card').dataset.max);
                progressBar.buffer = parseInt(tempElement.querySelector('.mdc-card').dataset.min) / parseInt(tempElement.querySelector('.mdc-card').dataset.max);
                
                MDCRipple.attachTo(tempElement.querySelector('.mdc-card__primary-action'));
                tempElement.querySelector('.favourite-button').addEventListener('click', favouriteButtonAction);
                MDCRipple.attachTo(tempElement.querySelector('.join-button'));
                joinButtonAction(tempElement.querySelector('.join-button'));

                $('.create-modal').modal('hide');
            }
        });
    }, false);
            /*reader.readAsDataURL(img);
        }
    });*/
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function handleFiles(evt) {
    var previewImage = evt.target.closest('.create-modal').querySelector('.preview-image');
    if (this.files.length == 0) {
        evt.target.nextElementSibling.querySelector('.mdc-fab__label').textContent = 'Choose a file';
        previewImage.src = "";
        return;
    }
    var file = this.files[0]; //now you can work with the file list
    evt.target.nextElementSibling.querySelector('.mdc-fab__label').textContent = file.name;
    var reader1 = new FileReader();
    reader1.addEventListener('load', function () {
        previewImage.src = this.result;
    }, false);
    reader1.readAsDataURL(file);
}


})();

