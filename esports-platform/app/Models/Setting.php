<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    protected function casts(): array
    {
        return [
            'value' => 'string',
        ];
    }

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;

        $value = $setting->value;
        if ($value === 'true') return true;
        if ($value === 'false') return false;
        if (is_numeric($value)) return $value + 0;

        $json = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) return $json;

        return $value;
    }

    public static function setValue(string $key, mixed $value): void
    {
        if (is_bool($value)) $value = $value ? 'true' : 'false';
        elseif (is_array($value)) $value = json_encode($value);

        self::updateOrCreate(['key' => $key], ['value' => (string) $value]);
    }
}
