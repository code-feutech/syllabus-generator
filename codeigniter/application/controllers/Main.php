<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Main extends MY_Custom_Controller {

  public function __construct() {
    parent::__construct();
  }
  
  public function index() {
    $this->_view('pages/home', 'CI Project Setup');
  }
}

?>