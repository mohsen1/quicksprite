$(function  () {
    $('#imagestabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    $('#imagestabs a:eq(1)').trigger('click'); //WTf? why bs don't make tab status active?
});