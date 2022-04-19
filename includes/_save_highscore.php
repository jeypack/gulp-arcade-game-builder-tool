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
//$score = $data->score;
$resultData = new stdClass();
$resultData->name = $data->name;
$resultData->score = $data->score;
$resultData->type = 'success';
$resultData->trimscore = ltrim($data->score, 0);
$maxEntries = 100;
$scoreMin = 20;
$scoreMax = 10000;
$resultData->highscore[] = array('name' => $data->name, 'score' => $data->score);
for ($i = $maxEntries; $i > 0; $i--) {
    $name = getRandomString(3) . getRandomString(3);
    //RANDOM
    //$score = round(random_int($scoreMin, $scoreMax) / 10) * 10;
    //ASCENDING
    $score = $scoreMin + (($i + 1) * 100);
    
    //in_array("100", $marks)
    //$name = uniqid('n', true);
    $resultData->highscore[] = array('name' => $name, 'score' => $score);
}

//$scores = array_column($resultData->highscore, 'price');
//array_multisort($scores, SORT_DESC, $resultData->highscore);

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

echo json_encode($resultData);
?>
