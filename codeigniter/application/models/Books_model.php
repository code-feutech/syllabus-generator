<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Books_model extends MY_Custom_Model {

  public function getByQuery($search = FALSE) {
    $this->db
      ->select('
        b.id AS id,
        b.citation AS citation,
        b.status AS status
      ')
      ->from('book_field_relation bfr')
      ->join('books b', 'b.id = bfr.book_id')
      ->join('fields f', 'f.id = bfr.field_id')
      ->where(array(
        'b.status !=' => -1
      ));
    
    if ($search) {
      $this->db->where("
        lower(concat(IFNULL(f.title, ''), IFNULL(b.citation, '')))
        like lower(concat('%', '$search', '%'))
      ");
    }

    $this->db->group_by('id');

    $query = $this->db->get();
    return $this->_res($query);
  }
  
  public function get() {
    $this->db
      ->from('books')
      ->where('status !=', -1)
      ->order_by('updated_at')
      ->order_by('created_at');
    $query = $this->db->get();
    return $this->_res($query);
  }

  public function getRelatedBooksWithFields($fields, $limit = 10) {
    if (!$fields) {
      return FALSE;
    }

    // concatenate fields
    $tags = implode(' ', $fields);
    $tags = strtolower($tags);

    $query = $this->db
      ->from('books')
      ->where("
        (
          (
            LOWER(tags) LIKE '%$tags%'
          ) OR MATCH(tags) AGAINST ('*$tags*' IN BOOLEAN MODE)
        )
      ", NULL, FALSE)
      ->where('status !=', -1)
      ->order_by('updated_at')
      ->order_by('created_at')
      ->limit($limit)
      ->get();
    return $this->_res($query);
  }

  public function insert($book) {
    return $this->_create('books', $book);
  }

  public function insertMultiple($books) {
    return $this->db->insert_batch('books', $books);
  }

  public function update($data, $where) {
    return $this->db
      ->set($data)
      ->where($where)
      ->update('books');
  }
}

?>
