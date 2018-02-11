<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Outcomes_model extends MY_Custom_Model {

  public function getByQuery($type, $search) {
    $this->db
      ->select('id, content')
      ->from('outcomes')
      ->where('type', $type)
      ->where("lower(content) like lower(concat('%', '$search', '%'))");
    $query = $this->db->get();
    return $this->_res($query);
  }

  public function getRelatedOutcomesWithFields($fields, $type, $limit = 10, $outcomes = FALSE) {
    if (!$fields) {
      return FALSE;
    }
    
    $this->db
      ->select('
        o.id AS id,
        o.content AS content
      ')
      ->from('outcome_field_relation ofr')
      ->join('outcomes o', 'o.id = ofr.outcome_id')
      ->join('fields f', 'f.id = ofr.field_id')
      ->where('o.type', $type)
      ->where_in('f.id', $fields);
    
    if ($outcomes) {
      $this->db->where_in('o.id', $outcomes);
    }

    $this->db
      ->group_by('o.id')
      ->order_by('COUNT(*)', 'DESC')
      ->limit($limit);
      
    $query = $this->db->get();
    return $this->_res($query);
  }
  
  public function getILOsFromCLOs($clo_content = FALSE, $limit = 10) {
    if (!$clo_content) {
      return FALSE;
    }

    $this->db
      ->select('ilo.id AS outcome_id')
      ->from('outcome_relation r')
      ->join('outcomes clo', 'clo.id = r.clo_id')
      ->join('outcomes ilo', 'ilo.id = r.ilo_id')
      ->where('clo.type', 1)
      ->where('ilo.type', 2)
      ->where("MATCH(clo.content) AGAINST('$clo_content')", NULL, FALSE)
      ->group_by('ilo.id')
      ->order_by('COUNT(*)', 'DESC')
      ->limit($limit);

    $query = $this->db->get();
    return $this->_res($query);
  }
}

?>