<?php
//require_once('_config.php');
// file_get_contents second parameter set to true for $data['name'] style
$data = json_decode(file_get_contents("php://input"));

function getRandomString($length) {
    $keys = array_merge(range('a', 'z'), range('A', 'Z'));
    for($i=0; $i < $length; $i++) {
        $key .= $keys[array_rand($keys)];
    }
    return $key;
}

function cmp($a, $b) {
    //return strcmp($a->name, $b->name);
    //return ($a->score < $b->score);
    if ($a['score'] == $b['score']) {
        return 0;
    }
    return ($a['score'] > $b['score']) ? -1 : 1;
}

//
$resultData = new stdClass();
$maxEntries = 25;
$scoreMin = 20;
$scoreMax = 60;
$resultData->highscore[] = array('name' => 'JEY', 'score' => $data->score);
for ($i = 0; $i < $maxEntries; $i++) {
    $name = getRandomString(3) . getRandomString(3);
    $score = round(random_int($scoreMin, $scoreMax) / 10) * 10;
    
    //in_array("100", $marks)
    //$name = uniqid('n', true);
    $resultData->highscore[] = array('name' => $name, 'score' => $score);
}
//rsort($resultData->highscore);
usort($resultData->highscore, "cmp");

//$resultData->score = $data->score;
//get hightscore winner
//$resultData->index = 0;
//get hightscore looser
//$resultData->index = 101;
$resultData->index = ($data->score > $scoreMax) ? 101 : 0;
//TODO: same nickname overwrites 

// convert matrix back to string list
// $comma_separated_matrix = isset($data->matrix) ? implode(",", $data->matrix) : '0,0,0,0,0,0';
/* $comma_separated_matrix = implode(",", $data->matrix);
$sql = "UPDATE users SET user_state='$data->userState', matrix='$comma_separated_matrix' WHERE userid='$userid'";
if (mysqli_query($conn, $sql)) {
    $data->done = true;
} else {
    $data->done = false;
    echo mysqli_error($conn);
}
//
if ($data->userState === 'scratch') {
    $data->gameState = 'WIN';
}

$conn->close(); */
if ($data->score > 50) {
    $result = 'WINNER';
} else {
    $result = 'LOOSER';
}
//
//$result = 'error';
echo json_encode($result);
//echo json_encode($resultData);
?>
