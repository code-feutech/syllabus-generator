<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Logout extends MY_Custom_Controller {
  public function index() {
    $this->_insert_userlog(0);
    session_destroy();
    $this->_json(TRUE);
  }
}

?>
