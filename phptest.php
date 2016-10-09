 <?php

    $filetext = "schedularlog.txt";
    $fp=fopen($filetext);
    $db1= pg_connect("host=localhost dbname=test user=lollgres password=hahad123") or die('Could not connect:'.pg_last_error());

    $q1=pg_query("SELECT DISTINCT hoa FROM pdaccountinfo WHERE status=1 ORDER BY hoa");
    $txt="(";
    while($r1=pg_fetch_array($q1,null,PGSQL_ASSOC))
    {
            $txt=$txt."'".$r1['hoa']."',";
    }
    $txt=substr($txt,0,-1);
    $txt=$txt.")";

    $q2=pg_fetch_array(pg_query("SELECT MAX(update) FROM datecheck"),null,PGSQL_ASSOC);
    $date=$q2['max'];

    pg_close($db1);
    $db2= pg_connect("host=10.10.24.16 dbname=testmpact1516 user=loll password=haha") or die('Could not connect:'.pg_last_error());

    $qt=pg_fetch_all(pg_query("SELECT MAX(utimestamp) FROM treceipts"));
    $mt=$qt[0]['max'];

    $q3=pg_query("SELECT * FROM treceipts WHERE hoa in $txt AND status='9' AND utimestamp>'$date' AND utimestamp<='$mt' AND hoa !='8443008000009000000NVN'") or die(pg_last_error());
    $q4=pg_query("SELECT * FROM tpayments WHERE hoa in $txt AND billstatus='9' AND utimestamp>'$date' AND utimestamp<='$mt' AND formno!='chq' AND formno!='IV'");
    $q5=pg_query("SELECT * FROM treceipts WHERE hoa ='8443008000009000000NVN' AND status='9' AND utimestamp>'$date' AND utimestamp<='$mt' ");
    pg_close($db2);
    $db3=  pg_connect("host=localhost dbname=test user=lollgres password=hahad123") or die('Could not connect:'.pg_last_error());
    $qtu=pg_query("INSERT INTO datecheck (update) VALUES ('$mt')");
    while($r3=pg_fetch_array($q5,null,PGSQL_ASSOC))
    {
           $content = "";
        $ddo=$r3['ddocode'];
        $hoa=$r3['hoa'];
        $qdate=$r3['scrolldate'];
        if($hoa=='8443008000009000000NVN')
        {
                $ddo='27022304001';
        }
        $amt=$r3['amount'];
        $chqno = $r3['transid'];
        $names=$r3['remittersname'];
        $imptxt="201516".$r3['stocode'].$r3['transid'].$r3['transtype'].$r3['transidslno'];
        if(trim($imptxt) != "") {
            $q55=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$ddo' AND hoa ='$hoa'"),null,PGSQL_ASSOC);
            $q6=pg_query("SELECT * FROM transactions WHERE impstring='$imptxt' AND transtype='2'");
            $bal=$q55['balance'];
            if(pg_num_rows($q6)==0)
            {
                $nbal=$bal+$amt;
                $content .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$bal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
               $q7=pg_query("UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa'");
               $content .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
               $content .= date('d-m-Y H:i:s')." - INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES (2,'$qdate','$chqno','$names','n/a','n/a','n/a',$amt,'$ddo','$hoa',1,'n/a',3,'n/a','$qdate',$nbal,'$imptxt',1) \n";
               $q233=pg_query_params($db3,"INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",array(2,$qdate,$chqno,$names,'n/a','n/a','n/a',$amt,$ddo,$hoa,1,'n/a',3,'n/a',$qdate,$nbal,$imptxt,'1'));
            }
            else
            {
                $r6=pg_fetch_array($q6,null,PGSQL_ASSOC);
                $tddo=$r6['issueuser'];
                $thoa=$r6['hoa'];            
                $qt=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$tddo' AND hoa = '$thoa'"));
                $tbal = $qt['balance'];
                $fbal=$tbal-$r6['partyamount'];

               $q9=pg_query("UPDATE pdaccountinfo SET balance=$fbal WHERE ddocode='$tddo' AND hoa='$thoa'");
                $id=$r6['id'];
               $q7=pg_query("DELETE FROM transactions WHERE id=$id");
               $content .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$tbal WHERE ddocode='$tddo' AND hoa='$thoa' \n";
                $content .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$fbal WHERE ddocode='$tddo' AND hoa='$thoa' \n";
               $content .= date('d-m-Y H:i:s')." - DELETE FROM transactions WHERE id=$id \n";
                $q55=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$ddo' AND hoa ='$hoa'"),null,PGSQL_ASSOC);
                $bal=$q55['balance'];
               $nbal=$bal+$amt;
               $q7=pg_query("UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa'");
               $q233=pg_query_params($db3,"INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",array(2,$qdate,$chqno,$names,'n/a','n/a','n/a',$amt,$ddo,$hoa,1,'n/a',3,'n/a',$qdate,$nbal,$imptxt,'1'));
               $content .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$fbal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
               $content .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
               $content .= date('d-m-Y H:i:s')." - INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES (2,'$qdate','$chqno','$names','n/a','n/a','n/a',$amt,'$ddo','$hoa',1,'n/a',3,'n/a','$qdate',$nbal,'$imptxt',1) \n";
            }

            file_put_contents($filetext, $content, FILE_APPEND);
        }
    }
    
    while($r3=pg_fetch_array($q3,null,PGSQL_ASSOC))
    {
           $content2 = "";
        $ddo=$r3['ddocode'];
        $hoa=$r3['hoa'];
        $qdate=$r3['scrolldate'];
        if($hoa=='8443008000009000000NVN')
        {
            $status=1;
            $ddo='27022304001';
        } else if($hoa == '8448001090003001000NVN' || $hoa == '8448001090003006000NVN' || $hoa == '8338001040001000000NVN') {
            $status=1;
            if(substr($ddo, 0,2) == '01') {

                $ddo = '01012202006';
            } else if(substr($ddo, 0,2) == '02') {

                $ddo = '02012202011';
            } else if(substr($ddo, 0,2) == '03') {

                $ddo = '03012202011';
            } else if(substr($ddo, 0,2) == '04') {

                $ddo = '04012202009';
            } else if(substr($ddo, 0,2) == '05') {

                $ddo = '05012202002';
            } else if(substr($ddo, 0,2) == '06') {

                $ddo = '06012202002';
            } else if(substr($ddo, 0,2) == '07') {

                $ddo = '07012202008';
            } else if(substr($ddo, 0,2) == '08') {

                $ddo = '08012202029';
            } else if(substr($ddo, 0,2) == '09') {

                $ddo = '09012202003';
            } else if(substr($ddo, 0,2) == '10') {

                $ddo = '10012202012';
            } else if(substr($ddo, 0,2) == '11') {

                $ddo = '110122020011';
            } else if(substr($ddo, 0,2) == '12') {

                $ddo = '12012202104';
            } else if(substr($ddo, 0,2) == '22') {

                $ddo = '22012202003';
            }
        } else if($hoa == '8448001200003000000NVN') {
            $status=1;
            if(substr($ddo, 0,2) == '01') {

                $ddo = '01010313001';
            } else if(substr($ddo, 0,2) == '02') {

                $ddo = '02010313001';
            } else if(substr($ddo, 0,2) == '03') {

                $ddo = '03012202010';
            } else if(substr($ddo, 0,2) == '04') {

                $ddo = '04010313002';
            } else if(substr($ddo, 0,2) == '05') {

                $ddo = '05012202007';
            } else if(substr($ddo, 0,2) == '06') {

                $ddo = '06010104003';
            } else if(substr($ddo, 0,2) == '07') {

                $ddo = '07010104002';
            } else if(substr($ddo, 0,2) == '08') {

                $ddo = '08010309001';
            } else if(substr($ddo, 0,2) == '09') {

                $ddo = '09010313001';
            } else if(substr($ddo, 0,2) == '10') {

                $ddo = '10010104006';
            } else if(substr($ddo, 0,2) == '11') {

                $ddo = '11010309001';
            } else if(substr($ddo, 0,2) == '12') {

                $ddo = '12010313001';
            } else if(substr($ddo, 0,2) == '22') {

                $ddo = '22010313001';
            }
        }
        else if($hoa == '8011001050001000000NVN') {
            $status=1;
            if(substr($ddo, 0,2) == '01') {

                $ddo = '01010704001';
            } else if(substr($ddo, 0,2) == '02') {

                $ddo = '02010704001';
            } else if(substr($ddo, 0,2) == '03') {

                $ddo = '03010704001';
            } else if(substr($ddo, 0,2) == '04') {

                $ddo = '04010704001';
            } else if(substr($ddo, 0,2) == '05') {

                $ddo = '05162704001';
            } else if(substr($ddo, 0,2) == '06') {

                $ddo = '06010704001';
            } else if(substr($ddo, 0,2) == '07') {

                $ddo = '07012402027';
            } else if(substr($ddo, 0,2) == '08') {

                $ddo = '08010704001';
            } else if(substr($ddo, 0,2) == '09') {

                $ddo = '09010704001';
            } else if(substr($ddo, 0,2) == '10') {

                $ddo = '10010704001';
            } else if(substr($ddo, 0,2) == '11') {

                $ddo = '11010704001';
            } else if(substr($ddo, 0,2) == '12') {

                $ddo = '12010704001';
            } else if(substr($ddo, 0,2) == '22') {

                $ddo = '22010704001';
            }
        }
        else if(substr($ddo, 2, 2) == '01' || substr($ddo, 0, 4) == '2702' || substr($ddo, 0, 4) == '2213')
        {
            $status=1;
        }
        else
        {
            $status=1;
        }
        if($status==1)
        {
            $amt=$r3['amount'];
            $chqno = $r3['transid'];
            $names=$r3['remittersname'];
            $imptxt="201516".$r3['stocode'].$r3['transid'].$r3['transtype'].$r3['transidslno'];
            $q5=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$ddo' AND hoa ='$hoa'"),null,PGSQL_ASSOC);
            $q6=pg_query("SELECT * FROM transactions WHERE impstring='$imptxt' AND transtype='2'");
            $bal=$q5['balance'];
            if(pg_num_rows($q6)==0)
            {
                $nbal=$bal+$amt;
               $q7=pg_query("UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa'");
               $content2 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$bal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
               $content2 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
               $content2 .= date('d-m-Y H:i:s')." - INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES (2,'$qdate','$chqno','$names','n/a','n/a','n/a',$amt,'$ddo','$hoa',1,'n/a',3,'n/a','$qdate',$nbal,'$imptxt',1) \n";

               $q233=pg_query_params($db3,"INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",array(2,$qdate,$chqno,$names,'n/a','n/a','n/a',$amt,$ddo,$hoa,1,'n/a',3,'n/a',$qdate,$nbal,$imptxt,'7'));
            }
            else
            {
                 $r6=pg_fetch_array($q6,null,PGSQL_ASSOC);
                 $tddo=$r6['issueuser'];
                 $thoa=$r6['hoa'];
                
                 $qt=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$tddo' AND hoa = '$thoa'"));
                 $tbal = $qt['balance'];
                 $fbal=$tbal-$r6['partyamount'];
                $q9=pg_query("UPDATE pdaccountinfo SET balance=$fbal WHERE ddocode='$tddo' AND hoa='$thoa'");
                $content2 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$tbal WHERE ddocode='$tddo' AND hoa='$thoa' \n";
                $content2 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$fbal WHERE ddocode='$tddo' AND hoa='$thoa' \n";

                 $id=$r6['id'];
                $q7=pg_query("DELETE FROM transactions WHERE id=$id");
                 $content2 .= date('d-m-Y H:i:s')." - DELETE FROM transactions WHERE id=$id \n";
                 $q55=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$ddo' AND hoa ='$hoa'"),null,PGSQL_ASSOC);
               $bal=$q55['balance'];
                 $nbal=$bal+$amt;
                $q7=pg_query("UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa'");
                $content2 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$bal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
                 $content2 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
                 $content2 .= date('d-m-Y H:i:s')." - INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES (2,'$qdate','$chqno','$names','n/a','n/a','n/a',$amt,'$ddo','$hoa',1,'n/a',3,'n/a','$qdate',$nbal,'$imptxt',1) \n";

                $q233=pg_query_params($db3,"INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,impstring,impactflag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",array(2,$qdate,$chqno,$names,'n/a','n/a','n/a',$amt,$ddo,$hoa,1,'n/a',3,'n/a',$qdate,$nbal,$imptxt,'7'));
            }

            file_put_contents($filetext, $content2, FILE_APPEND);
        }
    }
   while($r4=pg_fetch_array($q4,null,PGSQL_ASSOC))
    {
           $content3 ="";
        $qdate=$r4['scrolldate'];
        $ddo=$r4['ddocode'];
        $hoa=$r4['hoa'];
        $amt=$r4['gross'];
        $chqno = $r4['transid'];
        $imptxt="201516".$r4['stocode'].$r4['transid'].$r4['transtype'];
        $flg = 0;
        $q5=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$ddo' AND hoa ='$hoa'"),null,PGSQL_ASSOC);
        $q6=pg_query("SELECT * FROM transactions WHERE impstring='$imptxt' AND transtype='1'");
        $bal=$q5['balance'];
        if(pg_num_rows($q6)==0)
        {
            $nbal=$bal-$amt;
           $q71=pg_query("UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa'");
           $content3 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$bal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
           $content3 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
           $content3 .= date('d-m-Y H:i:s')." - INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,chqflag,impstring,impactflag) VALUES (1,'$qdate','$chqno','n/a','n/a','n/a','n/a',$amt,'$ddo','$hoa',1,'n/a',3,'n/a','$qdate',0,'$flg','$imptxt',1) \n";
           $q233=pg_query_params($db3,"INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,chqflag,impstring,impactflag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)",array(1,$qdate,$chqno,'n/a','n/a','n/a','n/a',$amt,$ddo,$hoa,1,'n/a',3,'n/a',$qdate,0,$flg,$imptxt,'1')) or die(pg_last_error());
           var_dump($q233);
        }
        else
        {
            $r6=pg_fetch_array($q6,null,PGSQL_ASSOC);
            $tddo=$r6['issueuser'];
            $thoa=$r6['hoa'];

            $qt=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$tddo' AND hoa = '$thoa'"));
            $tbal = $qt['balance'];
            $fbal=$tbal+$r6['partyamount'];
           $q9=pg_query("UPDATE pdaccountinfo SET balance=$fbal WHERE ddocode='$tddo' AND hoa='$thoa'");
           $content3 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$tbal WHERE ddocode='$tddo' AND hoa='$thoa' \n";
           $content3 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$fbal WHERE ddocode='$tddo' AND hoa='$thoa' \n";

            $id=$r6['id'];
           $q7=pg_query("DELETE FROM transactions WHERE id=$id");
           $content3 .= date('d-m-Y H:i:s')." - DELETE FROM transactions WHERE id=$id \n";
            $qt5=pg_fetch_array(pg_query("SELECT * FROM pdaccountinfo WHERE ddocode='$ddo' AND hoa = '$hoa'"));
            $bal=$qt5['balnce'];
            $nbal=$bal-$amt;
           $q71=pg_query("UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa'");
           $content3 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET oldbalance=$bal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
           $content3 .= date('d-m-Y H:i:s')." - UPDATE pdaccountinfo SET balance=$nbal WHERE ddocode='$ddo' AND hoa='$hoa' \n";
           $content3 .= date('d-m-Y H:i:s')." - INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,chqflag,impstring,impactflag) VALUES (1,'$qdate','$chqno','n/a','n/a','n/a','n/a',$amt,'$ddo','$hoa',1,'n/a',3,'n/a','$qdate',0,'$flg','$imptxt',1) \n";
           $q233=pg_query_params($db3,"INSERT INTO transactions (transtype,transdate,chequeno,partyname,partyacno,partybank,partyifsc,partyamount,issueuser,hoa,multiflag,partybranch,transstatus,purpose,confirmdate,balance,chqflag,impstring,impactflag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)",array(1,$qdate,$chqno,'n/a','n/a','n/a','n/a',$amt,$ddo,$hoa,1,'n/a',3,'n/a',$qdate,0,$flg,$imptxt,'1')) or die(pg_last_error());
        }

        file_put_contents($filetext, $content3, FILE_APPEND);
    }