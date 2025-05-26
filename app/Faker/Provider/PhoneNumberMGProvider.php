<?php
namespace App\Faker\Provider;

use Faker\Provider\Base;

class PhoneNumberMGProvider extends Base 
{
    protected static $formats = [
        '+261 32 ## ### ##',
        '+261 33 ## ### ##',
        '+261 34 ## ### ##',
        '032 ## ### ##',
        '033 ## ### ##',
        '034 ## ### ##',
    ];

    public function phoneNumberMG()
    {
        return static::numerify(static::randomElement(static::$formats));
    }
}