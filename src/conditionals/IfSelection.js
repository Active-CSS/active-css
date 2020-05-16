_c.IfSelection = o => {
  let selObj = window.getSelection();
  o.actVal = o.actVal._ACSSRepQuo().trim();
  return (selObj.toString() == o.actVal) ? true : false;
};
