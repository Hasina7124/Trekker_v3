<?php

namespace App\Http\Controllers;
use Inertia\Inertia;

use Illuminate\Http\Request;

class test extends Controller
{
    public function index () {
        return Inertia::render('test');
    }
}
